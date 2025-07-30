import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from 'axios';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [selectionMap, setSelectionMap] = useState<Map<number, Artwork>>(new Map());
  const [selectCount, setSelectCount] = useState<number>(0);

  const rowsPerPage = 12;

  const fetchArtworks = async (pageNumber: number) => {
    setLoading(true);
    const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}`);
    setArtworks(res.data.data);
    setTotalRecords(res.data.pagination.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks(page + 1);
  }, [page]);

  const onPage = (e: { page: number }) => {
    setPage(e.page);
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const newMap = new Map(selectionMap);
    const currentPageSelected: Artwork[] = e.value;

    currentPageSelected.forEach(row => newMap.set(row.id, row));
    artworks.forEach(row => {
      if (!currentPageSelected.find(r => r.id === row.id)) {
        newMap.delete(row.id);
      }
    });

    setSelectionMap(newMap);
    setSelectedRows(Array.from(newMap.values()));
  };

  const handleAutoSelect = async (count: number) => {
    const newMap = new Map(selectionMap);
    let needed = count;
    let tempPage = 1;

    while (needed > 0) {
      const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${tempPage}`);
      const data: Artwork[] = res.data.data;

      for (let i = 0; i < data.length && needed > 0; i++) {
        const row = data[i];
        if (!newMap.has(row.id)) {
          newMap.set(row.id, row);
          needed--;
        }
      }

      tempPage++;
    }

    setSelectionMap(newMap);
    setSelectedRows(Array.from(newMap.values()));
  };

  return (
    <div className="p-4">
      <h2 className="mb-3">Artworks Table</h2>

      <div className="flex items-center gap-3 mb-3">
        <i className="pi pi-check-square text-xl" />
        <InputNumber
          value={selectCount}
          onValueChange={(e) => setSelectCount(e.value ?? 0)}
          placeholder="Select N rows"
          min={1}
        />
        <Button label="Select Rows" onClick={() => handleAutoSelect(selectCount)} />
      </div>

      <DataTable
        value={artworks}
        paginator
        rows={rowsPerPage}
        first={page * rowsPerPage}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        onPage={onPage}
        selection={artworks.filter(a => selectionMap.has(a.id))}
        onSelectionChange={onSelectionChange}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start" />
        <Column field="date_end" header="End" />
      </DataTable>

      <div className="mt-4">
        <h3>Selected Artworks ({selectedRows.length})</h3>
        <ul>
          {selectedRows.map(row => (
            <li key={row.id}>{row.title} - {row.artist_display}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
