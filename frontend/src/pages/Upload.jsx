import React from "react";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";
import { AnnotationCanvas } from "@/components/annotation-canvas";
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
} from "lucide-react";

// Import the API service
import { annotationApi } from "../services/annotationApi";

// Main Upload component
import { JsonEditor } from "@/components/json-editor";
import { AnnotationList } from "@/components/annotation-list";

const Upload = () => {
  // Todo: Global variabls
  const [mode, setMode] = React.useState("box"); // 'box' | 'polygon'
  const [currentId, setCurrentId] = React.useState(null);
  const [images, setImages] = React.useState([]); // [{id, name, url(dataURL), width, height}]
  const [annotations, setAnnotations] = React.useState({}); // { imageId: [ {id, type, points|rect, text, gt, accuracy, label} ] }
  const [activeTab, setActiveTab] = React.useState("detected");
  const [lang, setLang] = React.useState("khm"); // OCR language

  const currentImage = images.find((i) => i.id === currentId);

  // React.useEffect(() => {
  //   // Fetch annotations when the component mounts
  //   fetchAnnotations();
  // }, [annotations, currentId, images]);

  // const fetchAnnotations = async () => {
  //   const data = {
  //     id: "a_1755156679281",
  //     label: "cat",
  //     image: "http://localhost:8080/uploads/cat.png",
  //     rect: {
  //       x: 10,
  //       y: 20,
  //       w: 100,
  //       h: 80,
  //     },
  //     text: "hello ahh thork",
  //   };

  //   try {
  //     const response = await annotationApi(data);
  //     console.log("Fetched annotations:", response);
  //   } catch (error) {
  //     console.error("Failed to fetch annotations:", error);
  //   }
  // };

  const handleFiles = async (items) => {
    // items are provided from ImageUploader as processed objects with dataURL, width, height
    const updated = [...images, ...items];
    setImages(updated);
    if (!currentId && updated.length > 0) {
      setCurrentId(updated[0].id);
    }
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
    setAnnotations((prev) => {
      const list = prev[currentId] ? [...prev[currentId]] : [];
      const idx = list.findIndex((a) => a.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch };
      }
      return { ...prev, [currentId]: list };
    });
  };

  // Onbatch functions for batch processing
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

  return (
    <div className="min-h-full bg-gray-50 m-6">
      {/* <h1 className="text-3xl font-bold">Annotate</h1> */}

      <div className="grid grid-cols-4 gap-4">
        {/* Upload images to annotate them. You can use the following keyboard shortcuts: */}
        <div>
          <div className="bg-[#E5E9EC] px-2 py-1 my-3 rounded inline-block w-fit">
            <h4 className="text-sm font-semibold">
              Tip: Use keyboard shortcuts
            </h4>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-blue-500" />
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
                      no images uploaded yet
                    </p>
                  )}
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      className={`w-full text-left p-2 text-sm hover:bg-blue-50 ${
                        img.id === currentId
                          ? "bg-blue-50 border-l-4 border-blue-500"
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
        <div className="col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="annotation"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Annotation Editor
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="detected" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Detected
                {/* {hasDetectedRegions && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedDetectedCount}
                  </Badge>
                )} */}
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Json Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="annotation" className="">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 flex items-center justify-between">
                  <CardTitle className="text-base">Annotation Canvas</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={mode === "box" ? "default" : "outline"}
                      className={
                        mode === "box" ? "bg-blue-500 hover:bg-blue-600" : ""
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
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                      onClick={() => setMode("polygon")}
                    >
                      <PenTool className="w-4 h-4" />
                      {/* Polygon */}
                    </Button>
                    <Button
                      id="btn-ocr-entire"
                      variant="outline"
                      size="sm"
                      // onClick={() =>
                      //   document.getElementById("btn-ocr-entire-real")?.click()
                      // }
                      // disabled={!currentImage}
                    >
                      <ScanText className="w-4 h-4 mr-2" />
                      OCR Entire
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentImage ? (
                    <AnnotationCanvas
                      key={currentImage.id}
                      image={currentImage}
                      mode={mode}
                      onAddAnnotation={addAnnotation}
                      annotations={annotations[currentId] || []}
                      onUpdateAnnotation={updateAnnotation}
                    />
                  ) : (
                    <div className="h-[420px] flex items-center justify-center text-gray-500">
                      canvasEmpty
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Annotation */}
            <TabsContent value="detected" className="mt-4">
              {/* <DetectedRegionsList
                image={currentImage}
                detectedRegions={currentImage?.detectedRegions || []}
                onToggleRegion={toggleDetectedRegion}
                onSelectAll={selectAllDetected}
                onConvertToAnnotations={convertDetectedToAnnotations}
              /> */}
            </TabsContent>

            <TabsContent value="visual" className="mt-4">
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

            <TabsContent value="json" className="mt-4">
              <JsonEditor
                images={images}
                annotations={annotations}
                currentId={currentId}
                onUpdate={handleJsonUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Upload;
