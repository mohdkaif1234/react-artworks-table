import React, { useEffect, useState } from 'react';
import {
  DataTable,
  type DataTableStateEvent,
  type DataTableSelectionMultipleChangeEvent,
} from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

const ArtworksTable: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10); // Actual page size used by table
  const [pageSizeInput, setPageSizeInput] = useState<number>(10); // Value from input field
  const [selectedRows, setSelectedRows] = useState<{ [id: number]: Artwork }>({});

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  async function fetchData(page = 1, limit = 10) {
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`);
      const json = await res.json();
      setData(
        json.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions || '',
          date_start: item.date_start,
          date_end: item.date_end,
        }))
      );
      setTotalRecords(json.pagination.total);
    } catch (err) {
      console.error(err);
    }
  }

  const onPageChange = (e: DataTableStateEvent) => {
    if (e.page !== undefined) {
      setCurrentPage(e.page + 1);
    }
  };

  const onRowSelectChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const sel = (e.value as Artwork[]) || [];
    const updated: { [id: number]: Artwork } = {};
    sel.forEach((art) => (updated[art.id] = art));
    setSelectedRows(updated);
  };

  const selected = Object.values(selectedRows);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setPageSizeInput(value);
    }
  };

  const handleSubmit = () => {
    if (pageSizeInput > 0 && pageSizeInput <= 1000) {
      setPageSize(pageSizeInput);
      setCurrentPage(1); // Reset to page 1
    } else {
      alert('Please enter a number between 1 and 1000');
    }
  };

  return (
    <div className="p-4">
      <h2>Artworks Table</h2>

      {selected.length > 0 && (
        <div className="p-3 mb-3 border rounded bg-gray-50">
          <strong>Selected Artworks ({selected.length}):</strong>
          <ul>{selected.map((a) => <li key={a.id}>{a.title}</li>)}</ul>
        </div>
      )}

      {/* ✅ Row count input and submit */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="rowsInput" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
          How many rows do you want?
        </label>
        <input
          id="rowsInput"
          type="number"
          min={1}
          max={1000}
          value={pageSizeInput}
          onChange={handleInputChange}
          style={{ width: '100px', padding: '6px', marginRight: '10px' }}
        />
        <button onClick={handleSubmit} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          Submit
        </button>
      </div>

      <DataTable
        value={data}
        paginator
        lazy
        rows={pageSize}
        first={(currentPage - 1) * pageSize}
        totalRecords={totalRecords}
        onPage={onPageChange}
        selection={selected}
        onSelectionChange={onRowSelectChange}
        dataKey="id"
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
