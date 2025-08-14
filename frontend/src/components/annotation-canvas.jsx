"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function AnnotationCanvas({
  image,
  mode,
  onAddAnnotation,
  annotations,
  onUpdateAnnotation,
}) {
  const containerRef = React.useRef(null)
  const imgRef = React.useRef(null)
  const canvasRef = React.useRef(null)
  const [drawing, setDrawing] = React.useState(false)
  const [temp, setTemp] = React.useState(null) // temp shape while drawing
  const [scale, setScale] = React.useState({ sx: 1, sy: 1 })

  React.useEffect(() => {
    const imgEl = imgRef.current
    const canvasEl = canvasRef.current
    if (!imgEl || !canvasEl || !image) return

    const doUpdate = () => {
      const imgNode = imgRef.current
      const cvs = canvasRef.current
      if (!imgNode || !cvs) return
      const width = Math.max(1, imgNode.clientWidth || 0)
      const height = Math.max(1, imgNode.clientHeight || 0)
      if (cvs.width !== width) cvs.width = width
      if (cvs.height !== height) cvs.height = height
      // Defer state update out of RO microtask
      setScale({ sx: image.width / width, sy: image.height / height })
    }

    // Initial sizing via rAF
    let raf = requestAnimationFrame(doUpdate)

    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(doUpdate)
    })
    ro.observe(imgEl)

    return () => {
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [image?.id])

  React.useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, temp, scale, image?.id])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // existing annotations
    for (const a of annotations) {
      ctx.save()
      ctx.strokeStyle = "rgba(16, 185, 129, 0.9)"
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
      ctx.lineWidth = 2
      if (a.type === "box") {
        const { x, y, w, h } = toCanvasRect(a.rect, scale)
        ctx.strokeRect(x, y, w, h)
        ctx.fillRect(x, y, w, h)
      } else if (a.type === "polygon") {
        const pts = a.points.map((p) => toCanvasPoint(p, scale))
        ctx.beginPath()
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      }
      ctx.restore()
    }
    // temp
    if (temp) {
      ctx.save()
      ctx.strokeStyle = "rgba(5, 150, 105, 0.9)"
      ctx.setLineDash([6, 4])
      if (temp.type === "box") {
        const { x, y, w, h } = temp
        ctx.strokeRect(x, y, w, h)
      } else if (temp.type === "polygon") {
        ctx.beginPath()
        temp.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return { x, y }
  }

  const onMouseDown = (e) => {
    if (!image) return
    const pos = getPos(e)
    if (mode === "box") {
      setDrawing(true)
      setTemp({ type: "box", x: pos.x, y: pos.y, w: 0, h: 0 })
    } else if (mode === "polygon") {
      setDrawing(true)
      if (!temp || temp.type !== "polygon") {
        setTemp({ type: "polygon", points: [pos] })
      } else {
        setTemp({ ...temp, points: [...temp.points, pos] })
      }
    }
  }

  const onMouseMove = (e) => {
    if (!drawing || !temp) return
    const pos = getPos(e)
    if (temp.type === "box") {
      setTemp({ ...temp, w: pos.x - temp.x, h: pos.y - temp.y })
    } else if (temp.type === "polygon") {
      // preview handled in draw with current points
    }
  }

  const onMouseUp = () => {
    if (!temp) return
    if (temp.type === "box") {
      const norm = toImageRect(temp, scale)
      onAddAnnotation({ type: "box", rect: norm })
      setTemp(null)
      setDrawing(false)
    } else if (temp.type === "polygon") {
      // for polygon, we keep adding until double-click to finish
      setDrawing(false)
    }
  }

  const onDblClick = () => {
    if (temp && temp.type === "polygon" && temp.points.length >= 3) {
      const normPts = temp.points.map((p) => toImagePoint(p, scale))
      onAddAnnotation({ type: "polygon", points: normPts })
      setTemp(null)
      setDrawing(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <div className="inline-block relative">
        <img
          ref={imgRef}
          src={image?.url || "/placeholder.svg"}
          alt={image?.name || "image to annotate"}
          className="max-h-[520px] w-auto h-auto object-contain select-none"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 cursor-crosshair",
            mode === "box" ? "cursor-crosshair" : "cursor-cell"
          )}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onDoubleClick={onDblClick}
          aria-label="Annotation overlay"
        />
      </div>
    </div>
  )
}

AnnotationCanvas.defaultProps = {
  image: null,
  mode: "box",
  onAddAnnotation: () => {},
  annotations: [],
  onUpdateAnnotation: () => {},
}

function toCanvasPoint(p, scale) {
  return { x: p.x / scale.sx, y: p.y / scale.sy }
}

function toCanvasRect(r, scale) {
  return {
    x: r.x / scale.sx,
    y: r.y / scale.sy,
    w: r.w / scale.sx,
    h: r.h / scale.sy,
  }
}

function toImagePoint(p, scale) {
  return { x: Math.round(p.x * scale.sx), y: Math.round(p.y * scale.sy) }
}

function toImageRect(r, scale) {
  const x = Math.min(r.x, r.x + r.w)
  const y = Math.min(r.y, r.y + r.h)
  const w = Math.abs(r.w)
  const h = Math.abs(r.h)
  return {
    x: Math.round(x * scale.sx),
    y: Math.round(y * scale.sy),
    w: Math.round(w * scale.sx),
    h: Math.round(h * scale.sy),
  }
}
