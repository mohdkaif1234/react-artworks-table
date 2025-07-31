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
  const pageSize = 10;
  const [selectedRows, setSelectedRows] = useState<{ [id: number]: Artwork }>({});

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  async function fetchData(page = 1) {
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}`);
      const json = await res.json();
      setData(json.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions || '',
        date_start: item.date_start,
        date_end: item.date_end,
      })));
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

  return (
    <div>
      <h2>Artworks Table</h2>
      {selected.length > 0 && (
        <div className="p-3 mb-3 border rounded bg-gray-50">
          <strong>Selected Artworks ({selected.length}):</strong>
          <ul>{selected.map((a) => <li key={a.id}>{a.title}</li>)}</ul>
        </div>
      )}

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
