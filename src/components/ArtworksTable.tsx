import React, { useEffect, useState } from 'react';
import { DataTable, type DataTableStateEvent, type DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
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
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: Artwork }>({});

  const fetchData = async (page = 1) => {
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}`);
      const json = await res.json();

      const artworks: Artwork[] = json.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));

      setData(artworks);
      setTotalRecords(json.pagination.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const onPageChange = (e: DataTableStateEvent) => {
    if (e.page !== undefined) {
      const newPage = Math.floor(e.page / pageSize) + 1;
      setCurrentPage(newPage);
    }
  };

  const onRowSelectChange = (e: DataTableSelectionMultipleChangeEvent<Artwork>) => {
    const selected = e.value as Artwork[];
    const updatedSelections: { [id: number]: Artwork } = { ...selectedRows };

    selected.forEach((art) => {
      updatedSelections[art.id] = art;
    });

    // Keep only selected from current page
    Object.keys(updatedSelections).forEach((id) => {
      const match = selected.find((a) => a.id === Number(id));
      if (!match) {
        delete updatedSelections[Number(id)];
      }
    });

    setSelectedRows(updatedSelections);
  };

  const isRowSelected = (row: Artwork) => !!selectedRows[row.id];

  const getSelectedRowsArray = (): Artwork[] => Object.values(selectedRows);

  const rowSelectionPanel = () => {
    const selected = getSelectedRowsArray();
    if (selected.length === 0) return null;

    return (
      <div className="p-3 mb-3 border border-gray-300 rounded bg-gray-50">
        <strong>Selected Artworks:</strong>
        <ul>
          {selected.map((art) => (
            <li key={art.id}>
              {art.title} ({art.date_start} - {art.date_end})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">Artworks Table</h2>

      {rowSelectionPanel()}

      <DataTable
        value={data}
        lazy
        paginator
        rows={pageSize}
        totalRecords={totalRecords}
        onPage={onPageChange}
        first={(currentPage - 1) * pageSize}
        selection={getSelectedRowsArray()}
        onSelectionChange={onRowSelectChange}
        dataKey="id"
        selectionMode="checkbox"
        rowClassName={(rowData) => (isRowSelected(rowData) ? 'p-highlight' : '')}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
