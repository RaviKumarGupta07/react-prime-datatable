import { useEffect, useRef, useState } from 'react';
import { DataTable, type DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { FaSlidersH } from 'react-icons/fa';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

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
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [rowInput, setRowInput] = useState<number>(0);
  const op = useRef<OverlayPanel>(null);

  const fetchArtworks = async () => {
    setLoading(true);
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${rows}`
    );
    const data = await response.json();
    setArtworks(data.data);
    setTotalRecords(data.pagination.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks();
  }, [page, rows]);

  const onPage = (e: DataTableStateEvent) => {
    setPage(e.page ?? 0);
    setRows(e.rows ?? 10);
  };

const handleSelectRows = async () => {
  const selected: Artwork[] = [];
  let needed = rowInput;
  let tempPage = 0;

  const combinedArtworks: Artwork[] = [];

  while (needed > 0) {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${tempPage + 1}&limit=${rows}`
    );
    const data = await response.json();
    const batch: Artwork[] = data.data;

    combinedArtworks.push(...batch);

    for (let i = 0; i < batch.length && needed > 0; i++) {
      selected.push(batch[i]);
      needed--;
    }

    if (batch.length < rows) break;
    tempPage++;
  }

  setArtworks(combinedArtworks); // show all selected rows
  setSelectedArtworks(selected); // select them
  op.current?.hide();
};



  const titleHeader = () => (
    <div className="flex items-center gap-2">
      <FaSlidersH
        className="cursor-pointer text-sm"
        onClick={(e) => op.current?.toggle(e)}
      />
      Title
      
      <OverlayPanel ref={op}>
        <div className="flex flex-col gap-2 p-2">
          <InputNumber
            value={rowInput}
            onValueChange={(e) => setRowInput(e.value ?? 0)}
            placeholder="Rows to select"
          />
          <Button label="Select" onClick={handleSelectRows} />
        </div>
      </OverlayPanel>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <Button
        label="Clear Selection"
        icon="pi pi-times"
        onClick={() => setSelectedArtworks([])}
      />
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={artworks}
        paginator
        rows={rows}
        first={page * rows}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        onPage={onPage}
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
        selectionMode="multiple"
        footer={footer}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header={titleHeader()} />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
    </div>
  );
}

export default App;
