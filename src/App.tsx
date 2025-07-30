import React from "react";
import ArtworksTable from "./components/ArtworksTable"; // ✅ must match exact file name and path

const App = () => {
  return (
    <div className="p-4">
      <h2>Art of mohd kaif - Artworks</h2>
      <ArtworksTable />
    </div>
  );
};

export default App;
