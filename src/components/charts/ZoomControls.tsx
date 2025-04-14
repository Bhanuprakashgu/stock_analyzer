
import { Button } from "@/components/ui/button";
import { ZoomIn, RefreshCw } from "lucide-react";

interface ZoomControlsProps {
  isZooming: boolean;
  toggleZoom: () => void;
  resetZoom: () => void;
  dataCount: number;
  hasCustomZoom: boolean;
}

export const ZoomControls = ({
  isZooming,
  toggleZoom,
  resetZoom,
  dataCount,
  hasCustomZoom
}: ZoomControlsProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm">
          <span className="font-medium">{dataCount}</span> days of data
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleZoom}
            className={isZooming ? "bg-blue-100" : ""}
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            {isZooming ? "Cancel" : "Zoom"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetZoom}
            disabled={!hasCustomZoom}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-center mt-1 mb-2">
        {isZooming ? "Click and drag to select zoom area" : "Click Zoom button to enable zoom selection"}
      </div>
    </>
  );
};
