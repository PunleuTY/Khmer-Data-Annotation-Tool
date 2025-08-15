"use client";

import React from "react";
import { cn } from "@/lib/utils";

const COLORS = {
  box: {
    stroke: "rgba(16, 185, 129, 0.9)",
    fill: "rgba(16, 185, 129, 0.15)",
  },
  temp: {
    stroke: "rgba(5, 150, 105, 0.9)",
    dash: [6, 4],
  },
};

export function AnnotationCanvas({
  image,
  mode,
  onAddAnnotation,
  annotations,
  onUpdateAnnotation,
}) {
  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const [drawing, setDrawing] = React.useState(false);
  const [temp, setTemp] = React.useState(null);
  const [scale, setScale] = React.useState({ sx: 1, sy: 1 });
  const [mousePos, setMousePos] = React.useState(null); // for polygon preview line

  /** Update canvas size and scale when image resizes */
  React.useEffect(() => {
    const imgEl = imgRef.current;
    const cvs = canvasRef.current;
    if (!imgEl || !cvs || !image) return;

    const updateScale = () => {
      const width = Math.max(1, imgEl.clientWidth);
      const height = Math.max(1, imgEl.clientHeight);
      if (cvs.width !== width) cvs.width = width;
      if (cvs.height !== height) cvs.height = height;

      const newScale = { sx: image.width / width, sy: image.height / height };
      setScale((prev) =>
        prev.sx !== newScale.sx || prev.sy !== newScale.sy ? newScale : prev
      );
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(imgEl);
    return () => ro.disconnect();
  }, [image?.id]);

  /** Redraw annotations when data changes */
  React.useEffect(() => {
    drawCanvas();
  }, [annotations, temp, scale, image?.id, mousePos]);

  const drawCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    annotations.forEach((a) => drawAnnotation(ctx, a, scale));
    if (temp) drawTempAnnotation(ctx, temp, mousePos);
  };

  const drawAnnotation = (ctx, annotation, scale) => {
    ctx.save();
    ctx.strokeStyle = COLORS.box.stroke;
    ctx.fillStyle = COLORS.box.fill;
    ctx.lineWidth = 2;

    if (annotation.type === "box") {
      const { x, y, w, h } = toCanvasRect(annotation.rect, scale);
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);
    } else if (annotation.type === "polygon") {
      const pts = annotation.points.map((p) => toCanvasPoint(p, scale));
      ctx.beginPath();
      pts.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    ctx.restore();
  };

  const drawTempAnnotation = (ctx, temp, mousePos) => {
    ctx.save();
    ctx.strokeStyle = COLORS.temp.stroke;
    ctx.setLineDash(COLORS.temp.dash);

    if (temp.type === "box") {
      const { x, y, w, h } = temp;
      ctx.strokeRect(x, y, w, h);
    } else if (temp.type === "polygon") {
      ctx.beginPath();
      temp.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const getPos = React.useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseDown = React.useCallback(
    (e) => {
      if (!image) return;
      const pos = getPos(e);

      if (mode === "box") {
        setDrawing(true);
        setTemp({ type: "box", x: pos.x, y: pos.y, w: 0, h: 0 });
      } else if (mode === "polygon") {
        setDrawing(true);
        setTemp((prev) =>
          !prev || prev.type !== "polygon"
            ? { type: "polygon", points: [pos] }
            : { ...prev, points: [...prev.points, pos] }
        );
      }
    },
    [image, mode, getPos]
  );

  const onMouseMove = React.useCallback(
    (e) => {
      if (!image) return;
      const pos = getPos(e);
      setMousePos(pos);

      if (!drawing || !temp) return;

      if (temp.type === "box") {
        setTemp((prev) => ({ ...prev, w: pos.x - prev.x, h: pos.y - prev.y }));
      }
    },
    [drawing, temp, image, getPos]
  );

  const onMouseUp = React.useCallback(() => {
    if (!temp) return;
    if (temp.type === "box") {
      const norm = toImageRect(temp, scale);
      onAddAnnotation({ type: "box", rect: norm });
      setTemp(null);
    }
    setDrawing(false);
  }, [temp, scale, onAddAnnotation]);

  const finishPolygon = React.useCallback(() => {
    if (temp?.type === "polygon" && temp.points.length >= 3) {
      const normPts = temp.points.map((p) => toImagePoint(p, scale));
      onAddAnnotation({ type: "polygon", points: normPts });
      setTemp(null);
      setDrawing(false);
    }
  }, [temp, scale, onAddAnnotation]);

  const onDblClick = React.useCallback(() => {
    finishPolygon();
  }, [finishPolygon]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        finishPolygon();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [finishPolygon]);

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
            "absolute inset-0",
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
  );
}

AnnotationCanvas.defaultProps = {
  image: null,
  mode: "box",
  onAddAnnotation: () => {},
  annotations: [],
  onUpdateAnnotation: () => {},
};

function toCanvasPoint(p, scale) {
  return { x: p.x / scale.sx, y: p.y / scale.sy };
}
function toCanvasRect(r, scale) {
  return {
    x: r.x / scale.sx,
    y: r.y / scale.sy,
    w: r.w / scale.sx,
    h: r.h / scale.sy,
  };
}
function toImagePoint(p, scale) {
  return { x: Math.round(p.x * scale.sx), y: Math.round(p.y * scale.sy) };
}
function toImageRect(r, scale) {
  const x = Math.min(r.x, r.x + r.w);
  const y = Math.min(r.y, r.y + r.h);
  return {
    x: Math.round(x * scale.sx),
    y: Math.round(y * scale.sy),
    w: Math.round(Math.abs(r.w) * scale.sx),
    h: Math.round(Math.abs(r.h) * scale.sy),
  };
}
