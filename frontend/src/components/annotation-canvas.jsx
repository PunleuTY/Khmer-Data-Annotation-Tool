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
  selected: {
    stroke: "rgba(59, 130, 246, 0.9)",
    fill: "rgba(59, 130, 246, 0.15)",
  },
};

export function AnnotationCanvas({
  image,
  mode,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
}) {
  const containerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const [drawing, setDrawing] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [temp, setTemp] = React.useState(null);
  const [scale, setScale] = React.useState({ sx: 1, sy: 1 });
  const [mousePos, setMousePos] = React.useState(null);
  const [tempDragPosition, setTempDragPosition] = React.useState(null);

  /** Update scale on image resize */
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
  }, [annotations, temp, scale, image?.id, mousePos, selectedId]);

  const drawCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    annotations.forEach((a, i) => {
      const annotationToShow =
        dragging && a.id === selectedId && tempDragPosition
          ? tempDragPosition
          : a;
      drawAnnotation(ctx, annotationToShow, scale, a.id === selectedId, i);
    });

    if (temp) drawTempAnnotation(ctx, temp, mousePos);
  };

  /** Draw saved annotation */
  const drawAnnotation = (ctx, annotation, scale, selected, index) => {
    ctx.save();
    ctx.strokeStyle = selected ? COLORS.selected.stroke : COLORS.box.stroke;
    ctx.fillStyle = selected ? COLORS.selected.fill : COLORS.box.fill;
    ctx.lineWidth = 2;

    if (annotation.type === "box") {
      const { x, y, w, h } = toCanvasRect(annotation.rect, scale);
      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);

      // ✅ Draw label above the box
      const label = `#${index + 1}`;
      ctx.font = "16px Arial";

      // Measure text width for background
      const textWidth = ctx.measureText(label).width;
      const textHeight = 18; // approximate height

      // Background rectangle
      ctx.fillStyle = "red";
      ctx.fillRect(x, y - textHeight, textWidth + 6, textHeight); // 6px padding

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(label, x + 3, y - 3); // 3px padding
    }

    if (annotation.type === "polygon") {
      ctx.beginPath();
      annotation.points
        .map((p) => toCanvasPoint(p, scale))
        .forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      // Label at first point of polygon
      const first = toCanvasPoint(annotation.points[0], scale);
      const label = `#${index + 1}`;
      ctx.font = "16px Arial";

      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;

      ctx.fillStyle = "red";
      ctx.fillRect(first.x, first.y - textHeight, textWidth + 6, textHeight);

      ctx.fillStyle = "white";
      ctx.fillText(label, first.x + 3, first.y - 3);
    }

    ctx.restore();
  };

  /** Draw temporary annotation while drawing */
  const drawTempAnnotation = (ctx, temp, mousePos) => {
    ctx.save();
    ctx.strokeStyle = COLORS.temp.stroke;
    ctx.setLineDash(COLORS.temp.dash);

    if (temp.type === "box") {
      const { x, y, w, h } = temp;
      ctx.strokeRect(x, y, w, h);
    }

    if (temp.type === "polygon") {
      ctx.beginPath();
      temp.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
    }

    ctx.restore();
  };

  /** Clamp helper */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  function clampRectToImage(rect, image) {
    const x = clamp(rect.x, 0, image.width);
    const y = clamp(rect.y, 0, image.height);

    const w = Math.max(0, Math.min(rect.w, image.width - x));
    const h = Math.max(0, Math.min(rect.h, image.height - y));

    return { x, y, w, h };
  }

  function clampPointsToImage(points, image) {
    return points.map((p) => ({
      x: clamp(p.x, 0, image.width),
      y: clamp(p.y, 0, image.height),
    }));
  }

  const getPos = React.useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    return {
      x: clamp(rawX, 0, rect.width),
      y: clamp(rawY, 0, rect.height),
    };
  }, []);

  /** Find shape under cursor */
  function findShapeAt(pos) {
    return annotations.find((a) => {
      if (a.type === "box") {
        const { x, y, w, h } = toCanvasRect(a.rect, scale);
        return pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h;
      }
      if (a.type === "polygon") {
        const pts = a.points.map((p) => toCanvasPoint(p, scale));
        return pointInPolygon(pos, pts);
      }
      return false;
    });
  }

  /** Mouse Down */
  const onMouseDown = React.useCallback(
    (e) => {
      if (!image) return;
      const pos = getPos(e);

      if (mode === "edit") {
        const hit = findShapeAt(pos);
        if (hit) {
          setSelectedId(hit.id);
          setDragging(true);
          setDragOffset({ startPos: pos, shape: hit });
          setTempDragPosition(hit);
          return;
        } else {
          setSelectedId(null);
        }
      }

      if (mode === "box") {
        setDrawing(true);
        setTemp({ type: "box", x: pos.x, y: pos.y, w: 0, h: 0 });
      }

      if (mode === "polygon") {
        const clamped = {
          x: clamp(pos.x, 0, canvasRef.current.width),
          y: clamp(pos.y, 0, canvasRef.current.height),
        };
        if (!temp) {
          setTemp({ type: "polygon", points: [clamped] });
        } else {
          setTemp((prev) => ({
            ...prev,
            points: [...prev.points, clamped],
          }));
        }
      }
    },
    [image, mode, getPos, annotations, scale, temp]
  );

  /** Mouse Move */
  const onMouseMove = React.useCallback(
    (e) => {
      if (!image) return;
      const pos = getPos(e);
      setMousePos(pos);

      if (drawing && temp?.type === "box") {
        setTemp((prev) => {
          const clampedX = clamp(pos.x, 0, canvasRef.current.width);
          const clampedY = clamp(pos.y, 0, canvasRef.current.height);

          return {
            ...prev,
            w: clampedX - prev.x,
            h: clampedY - prev.y,
          };
        });
      }

      if (dragging && selectedId && dragOffset) {
        const dx = (pos.x - dragOffset.startPos.x) * scale.sx;
        const dy = (pos.y - dragOffset.startPos.y) * scale.sy;
        const shape = dragOffset.shape;

        if (shape.type === "box") {
          const movedRect = {
            ...shape.rect,
            x: shape.rect.x + dx,
            y: shape.rect.y + dy,
          };
          setTempDragPosition({
            ...shape,
            rect: clampRectToImage(movedRect, image),
          });
        }

        if (shape.type === "polygon") {
          const movedPoints = shape.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
          setTempDragPosition({
            ...shape,
            points: clampPointsToImage(movedPoints, image),
          });
        }
      }
    },
    [drawing, dragging, temp, selectedId, scale, image, getPos, dragOffset]
  );

  /** Mouse Up */
  /** Mouse Up */
  const onMouseUp = React.useCallback(() => {
    if (temp?.type === "box" && drawing) {
      const norm = toImageRect(temp, scale);
      const clampedRect = clampRectToImage(norm, image);

      // ✅ Only save if rect is not fully zeroed out
      if (
        clampedRect.w !== 0 &&
        clampedRect.h !== 0 &&
        clampedRect.x !== 0 &&
        clampedRect.y !== 0
      ) {
        onAddAnnotation({
          id: Date.now().toString(),
          type: "box",
          rect: clampedRect,
        });
      }

      setTemp(null);
    }

    if (dragging && selectedId && tempDragPosition) {
      if (tempDragPosition.type === "box") {
        const finalRect = clampRectToImage(tempDragPosition.rect, image);

        if (
          !(
            finalRect.x === 0 &&
            finalRect.y === 0 &&
            finalRect.w === 0 &&
            finalRect.h === 0
          )
        ) {
          onUpdateAnnotation(selectedId, { rect: finalRect });
        }
      }

      if (tempDragPosition.type === "polygon") {
        const finalPts = clampPointsToImage(tempDragPosition.points, image);
        if (finalPts.length >= 3) {
          onUpdateAnnotation(selectedId, { points: finalPts });
        }
      }

      setTempDragPosition(null);
    }

    setDrawing(false);
    setDragging(false);
    setDragOffset(null);
  }, [
    temp,
    drawing,
    scale,
    image,
    onAddAnnotation,
    dragging,
    selectedId,
    tempDragPosition,
    onUpdateAnnotation,
  ]);

  /** Double Click to finish polygon */
  const onDblClick = () => {
    if (temp && temp.type === "polygon" && temp.points.length >= 3) {
      const normPts = temp.points.map((p) => toImagePoint(p, scale));
      const clampedPts = clampPointsToImage(normPts, image);
      onAddAnnotation({
        id: Date.now().toString(),
        type: "polygon",
        points: clampedPts,
      });
      setTemp(null);
    }
  };

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
            mode === "box"
              ? "cursor-crosshair"
              : mode === "edit"
              ? "cursor-move"
              : "cursor-cell"
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

/** Conversion Helpers */
function toCanvasRect(r, scale) {
  return {
    x: r.x / scale.sx,
    y: r.y / scale.sy,
    w: r.w / scale.sx,
    h: r.h / scale.sy,
  };
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

function toCanvasPoint(p, scale) {
  return { x: p.x / scale.sx, y: p.y / scale.sy };
}

function toImagePoint(p, scale) {
  return { x: Math.round(p.x * scale.sx), y: Math.round(p.y * scale.sy) };
}

/** Check if a point is inside a polygon */
function pointInPolygon(point, vs) {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x,
      yi = vs[i].y;
    const xj = vs[j].x,
      yj = vs[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
