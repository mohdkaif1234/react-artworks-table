import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=10`);
      const artworks = res.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions || '',
        date_start: item.date_start,
        date_end: item.date_end,
      }));
      setData(artworks);
      setTotalRecords(res.data.pagination.total);
    } catch (err) {
      console.error('API error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const onPage = (e: { page: number }) => {
    setCurrentPage(e.page + 1);
  };

  const isRowSelected = (id: number) => selectedIds.has(id);

  const toggleRow = (id: number, checked: boolean) => {
    const updated = new Set(selectedIds);
    if (checked) updated.add(id);
    else updated.delete(id);
    setSelectedIds(updated);
  };

  const toggleSelectAll = (checked: boolean) => {
    const updated = new Set(selectedIds);
    data.forEach((row) => {
      if (checked) updated.add(row.id);
      else updated.delete(row.id);
    });
    setSelectedIds(updated);
  };

  const headerCheckbox = () => {
    const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row.id));
    return (
      <Checkbox
        checked={allSelected}
        onChange={(e) => toggleSelectAll(e.checked!)}
      />
    );
  };

  const rowCheckbox = (rowData: Artwork) => {
    return (
      <Checkbox
        checked={isRowSelected(rowData.id)}
        onChange={(e) => toggleRow(rowData.id, e.checked!)}
      />
    );
  };

  const selectionPanel = () => {
    if (selectedIds.size === 0) return null;
    return (
      <div className="p-3 mb-3 border-round border-1 surface-border">
        <strong>{selectedIds.size} artworks selected.</strong>
        <Button
          label="Clear Selection"
          icon="pi pi-times"
          className="p-button-text p-button-danger ml-3"
          onClick={() => setSelectedIds(new Set())}
        />
      </div>
    );
  };

  return (
    <div>
      {selectionPanel()}
      <DataTable
        value={data}
        paginator
        rows={10}
        lazy
        totalRecords={totalRecords}
        loading={loading}
        dataKey="id"
        onPage={onPage}
      >
        <Column
          header={headerCheckbox()}
          body={rowCheckbox}
          style={{ width: '3em' }}
        />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Origin" sortable />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
