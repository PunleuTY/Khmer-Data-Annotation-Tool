import React from "react";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ImagePlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ScanText,
  SquareDashedMousePointer,
  PenTool,
  Zap,
  FileJson,
  Download,
  Undo,
  Redo,
} from "lucide-react";

import { JsonEditor } from "@/components/json-editor";
import { AnnotationList } from "@/components/annotation-list";
import { AnnotationCanvas } from "@/components/annotation-canvas";
import { levenshteinSimilarity } from "@/lib/levenshtein";
import { OcrControls } from "@/components/ocr-controls";
import { saveProject, loadProject, clearProject } from "@/lib/storage";
import { ExportDialog } from "@/components/export-dialog";
import { uploadImages } from "@/server/sendImageAPI";
import { CurrentProjectContext } from "./Myproject";

// --- CONSTANTS ---
const HISTORY_LIMIT = 50;

// --- HELPERS ---
function transformData(data) {
  const result = {};
  let counter = 1;

  (Array.isArray(data) ? data : [data]).forEach((item) => {
    if (!item.annotations || !item.annotations.images) return;
    const aid = item.id;

    item.annotations.images.forEach((img) => {
      const imgAnns = (img.annotations || []).map((ann) => {
        const [x1, y1, x2, y2] =
          ann.box_coordinates?.length === 4
            ? ann.box_coordinates
            : [0, 0, 0, 0];
        return {
          id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          label: ann.label || "",
          rect: {
            x: x1,
            y: y1,
            w: Math.max(0, x2 - x1),
            h: Math.max(0, y2 - y1),
          },
          type: "box",
          text: ann.extracted_text || "",
          gt: "",
          accuracy: ann.accuracy ?? null,
        };
      });

      result[aid] = [...(result[aid] || []), ...imgAnns];
      counter++;
    });
  });

  return result;
}

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Annotate = () => {
  const [mode, setMode] = React.useState("box"); // 'box' | 'polygon'
  const [currentId, setCurrentId] = React.useState(null);
  const [images, setImages] = React.useState([]); // [{id, name, url(dataURL), width, height}]
  const [annotations, setAnnotations] = React.useState({}); // { imageId: [ {id, type, points|rect, text, gt, accuracy, label} ] }
  const [activeTab, setActiveTab] = React.useState("annotation");
  const [lang, setLang] = React.useState("khm"); // OCR language
  const [exportOpen, setExportOpen] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [fullOcr, setFullOcr] = React.useState({ text: "", conf: null });

  const currentImage = images.find((i) => i.id === currentId);
  const [batchInfo, setBatchInfo] = React.useState({
    running: false,
    current: 0,
    total: 0,
    pct: 0,
  });

  const [selectedFiles, setSelectedFiles] = React.useState([]);

  React.useEffect(() => {
    // Fetch annotations when the component mounts
    console.log(images);
  }, [annotations, currentId, images]);

  const runOcr = async () => {
    // const data = await uploadImages(
    //   CurrentProjectContext,
    //   selectedFiles.map((i) => i.file || i),
    //   annotations
    // );

    console.log("DATA", data);
  };

  React.useEffect(() => {
    // Fetch annotations when the component mounts
    console.log("images", images);
    console.log("annotations", annotations);
    console.log("select image", selectedFiles);
  }, [annotations, currentId, images, selectedFiles]);

  // --- Init History ---
  React.useEffect(() => {
    if (history.length === 0) {
      const initialState = {
        annotations: { ...annotations },
        textAnnotations: { ...fullOcr },
        timestamp: Date.now(),
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, []);

  React.useEffect(() => {
    saveProject({ images, annotations, currentId, lang });
  }, [images, annotations, currentId, lang]);

  const handleFiles = async (items) => {
    const updated = [...images, ...items];
    setImages(updated);
    if (!currentId && updated.length > 0) {
      setCurrentId(updated[0].id);
    }

    setSelectedFiles(items);
  };

  const onClearAll = () => {
    setImages([]);
    setAnnotations({});
    setCurrentId(null);
    setFullOcr({ text: "", conf: null });
    clearProject();
  };

  const prevImage = () => {
    if (!images.length || currentId == null) return;
    const idx = images.findIndex((i) => i.id === currentId);
    const prev = (idx - 1 + images.length) % images.length;
    setCurrentId(images[prev].id);
  };

  const nextImage = () => {
    if (!images.length || currentId == null) return;
    const idx = images.findIndex((i) => i.id === currentId);
    const next = (idx + 1) % images.length;
    setCurrentId(images[next].id);
  };

  const addAnnotation = (ann) => {
    saveToHistory();

    setAnnotations((prev) => {
      const list = prev[currentId] ? [...prev[currentId]] : [];
      list.push({
        ...ann,
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: "",
        gt: "",
        accuracy: null,
        label: "",
      });
      return { ...prev, [currentId]: list };
    });
  };

  const updateAnnotation = (id, patch) => {
    saveToHistory();

    setAnnotations((prev) => {
      const list = prev[currentId] ? [...prev[currentId]] : [];
      const idx = list.findIndex((a) => a.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch };
      }
      return { ...prev, [currentId]: list };
    });
  };

  const onBatchStart = (total) =>
    setBatchInfo({ running: true, total, current: 0, pct: 0 });
  const onBatchStep = (current) =>
    setBatchInfo((b) => ({
      ...b,
      current,
      pct: b.total ? Math.round((current / b.total) * 100) : 0,
    }));
  const onBatchEnd = () =>
    setBatchInfo({ running: false, total: 0, current: 0, pct: 0 });

  const handleJsonUpdate = (newAnnotations) => {
    setAnnotations(newAnnotations);
  };

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => {
      const list = prev[currentId]
        ? prev[currentId].filter((a) => a.id !== id)
        : [];
      return { ...prev, [currentId]: list };
    });
  };

  const handleSetGT = (id, value) => {
    updateAnnotation(id, { gt: value });
    const ann = (annotations[currentId] || []).find((a) => a.id === id);
    const extracted = ann?.text || "";
    const accuracy = levenshteinSimilarity(extracted, value);
    updateAnnotation(id, { accuracy });
  };

  const saveToHistory = React.useCallback(() => {
    const currentState = {
      annotations: { ...annotations },
      textAnnotations: { ...fullOcr },
      timestamp: Date.now(),
    };

    // console.log("Current annotations:", annotations);
    // console.log("Saving to history:", currentState);
    // console.log("Current history index:", historyIndex);

    setHistory((prevHistory) => {
      // Remove any future history if we're not at the latest point
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(currentState);

      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      }

      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [annotations, fullOcr, historyIndex]);
  // Updated undo function
  const undo = React.useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setAnnotations(previousState.annotations);
      setFullOcr(previousState.textAnnotations);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  // Optional: Add redo functionality
  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setAnnotations(nextState.annotations);
      setFullOcr(nextState.textAnnotations);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  return (
    <div className="min-h-full bg-white p-6">
      <h1 className="text-5xl text-[#ff3f34] font-cadt pb-5">Annotate</h1>

      {/* REVISED: This grid now adapts for different screen sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Upload images to annotate them. You can use the following keyboard shortcuts: */}
        <div>
          <Card
            className={
              "bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border-b-4 border-t-4 border-[#12284c]"
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader onFiles={handleFiles} />
              <div className="mt-4">
                <Label className="text-xs text-gray-600">Dataset</Label>
                <div className="mt-2 max-h-56 overflow-auto border rounded-md divide-y">
                  {images.length === 0 && (
                    <p className="text-sm text-gray-500 p-3">
                      No images uploaded yet
                    </p>
                  )}
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      className={`w-full text-left p-2 text-sm hover:bg-blue-50 ${
                        img.id === currentId
                          ? "bg-blue-50 border-l-4 border-[#ff3f34]"
                          : ""
                      }`}
                      onClick={() => setCurrentId(img.id)}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {img.name}
                      </div>
                      <div className="text-gray-500">
                        {img.width}×{img.height} · #{idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    disabled={
                      !images.length ||
                      images.findIndex((i) => i.id === currentId) === 0
                    }
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <span className="text-xs text-gray-600">
                    {images.length > 0
                      ? `${images.findIndex((i) => i.id === currentId) + 1} / ${
                          images.length
                        }`
                      : "0 / 0"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    disabled={
                      !images.length ||
                      images.findIndex((i) => i.id === currentId) ===
                        images.length - 1
                    }
                    aria-label="Next Image"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anotation Canvas */}
        {/* REVISED: This section now spans all columns on small screens, and fewer on larger screens */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border-b-4 border-t-4 border-[#12284c]">
            <CardHeader className="pb-3 flex items-center justify-between">
              <CardTitle className="text-base">Annotation Canvas</CardTitle>
              <div className="flex items-center gap-2">
                {/* <OcrControls
                  lang={lang}
                  setLang={setLang}
                  image={currentImage}
                  onOcrResult={(res) => setFullOcr(res)}
                /> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0 || history.length <= 1}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Undo className="h-4 w-4" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Redo className="h-4 w-4" />
                  Redo
                </Button>
                <Button
                  variant={mode === "box" ? "default" : "outline"}
                  className={
                    mode === "box"
                      ? "bg-[#ff3f34] text-white hover:bg-[#ff3e34dc] "
                      : ""
                  }
                  onClick={() => setMode("box")}
                >
                  <SquareDashedMousePointer className="w-4 h-4" />
                  {/* Box */}
                </Button>
                <Button
                  variant={mode === "polygon" ? "default" : "outline"}
                  className={
                    mode === "polygon"
                      ? "bg-[#ff3f34] text-white hover:bg-[#ff3e34dc]"
                      : ""
                  }
                  onClick={() => setMode("polygon")}
                >
                  <PenTool className="w-4 h-4" />
                  {/* Polygon */}
                </Button>
                <Button
                  variant={mode === "edit" ? "default" : "outline"}
                  className={
                    mode === "edit"
                      ? "bg-[#ff3f34] text-white hover:bg-[#ff3e34dc] "
                      : ""
                  }
                  onClick={() => setMode("edit")}
                >
                  <PenTool className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  id="btn-ocr-entire"
                  variant="outline"
                  size="sm"
                  onClick={runOcr}
                >
                  <ScanText className="w-4 h-4 mr-2" />
                  OCR Entire
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setExportOpen(true)}
                  className={
                    "bg-white text-black hover:text-white hover:bg-[#76bc21] "
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClearAll}
                  className={"bg-[#ff3f34] text-white hover:bg-[#ff3e34b2] "}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ClearAll
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentImage ? (
                <AnnotationCanvas
                  image={currentImage}
                  mode={mode}
                  annotations={annotations[currentId] || []}
                  onAddAnnotation={addAnnotation} // Use the proper addAnnotation function instead of inline function
                  onUpdateAnnotation={updateAnnotation} // uses your patch logic
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-500">
                  Canvas Empty
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* REVISED: This section now spans all columns on all screen sizes to take up full width */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="annotation"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Json Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="annotation">
              <AnnotationList
                image={currentImage}
                annotations={annotations[currentId] || []}
                onSetGT={handleSetGT}
                onDelete={deleteAnnotation}
                onUpdate={updateAnnotation}
                lang={lang}
                onBatchStart={onBatchStart}
                onBatchStep={onBatchStep}
                onBatchEnd={onBatchEnd}
              />
            </TabsContent>

            <TabsContent value="detected" className="mt-4"></TabsContent>

            <TabsContent
              value="json"
              className="mt-4 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border-b-4 border-t-4 border-[#ff3f34]"
            >
              <JsonEditor
                images={images}
                annotations={annotations}
                currentId={currentId}
                onUpdate={handleJsonUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          images={images}
          annotations={annotations}
          projectMeta={{ name: "Khmer Data Annotation Tool", lang }}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Annotate;
