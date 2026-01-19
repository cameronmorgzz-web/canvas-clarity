import { memo } from "react";
import "./mesh.css";

interface MeshBackgroundProps {
  colorShift?: boolean;
}

export const MeshBackground = memo(function MeshBackground({ colorShift = false }: MeshBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden mesh-container">
      {/* Multiple overlapping gradient blobs - CSS animated */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />
      <div className="mesh-blob mesh-blob-4" />
      
      {/* Color shift layer */}
      {colorShift && (
        <div className="mesh-color-shift" />
      )}
    </div>
  );
});
