import "./App.css";
import { useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [peso1, setPeso1] = useState([]);
  const [peso2, setPeso2] = useState([]);
  const [resultado, setResultado] = useState([]);

  const [nombrePeso1, setNombrePeso1] =
    useState("");

  const [nombrePeso2, setNombrePeso2] =
    useState("");

  const leerExcel = (
    file,
    setter,
    setNombre
  ) => {
    if (!file) return;

    setNombre(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(
        e.target.result
      );

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const json =
        XLSX.utils.sheet_to_json(sheet);

      setter(json);
    };

    reader.readAsArrayBuffer(file);
  };

  const compararPesajes = () => {
    const comparados = [];

    peso2.forEach((animalNuevo) => {
      const animalViejo = peso1.find(
        (a) =>
          String(a.EID) ===
          String(animalNuevo.EID)
      );

      if (animalViejo) {
        const pesoViejo =
          Number(
            animalViejo["Peso 1"]
          ) ||
          Number(animalViejo.Peso) ||
          0;

        const pesoNuevo =
          Number(
            animalNuevo["Peso 2"]
          ) ||
          Number(animalNuevo.Peso) ||
          0;

        const ganancia =
          pesoNuevo - pesoViejo;

        const gananciaDiaria = (
          ganancia / 30
        ).toFixed(2);

        let estado = "";

        if (gananciaDiaria > 1) {
          estado = "Excelente";
        } else if (
          gananciaDiaria >= 0.7
        ) {
          estado = "Bueno";
        } else if (
          gananciaDiaria >= 0.4
        ) {
          estado = "Normal";
        } else if (
          gananciaDiaria >= 0
        ) {
          estado = "Malo";
        } else {
          estado = "Perdió peso";
        }

        comparados.push({
          eid: animalNuevo.EID,
          vid: animalNuevo.VID,
          fecha:
            animalNuevo.Date ||
            animalNuevo.Fecha,
          peso1: pesoViejo,
          peso2: pesoNuevo,
          ganancia,
          gananciaDiaria,
          estado,
        });
      }
    });

    setResultado(comparados);
  };

  const descargarExcel = () => {
    const datos = resultado.map(
      (animal) => ({
        EID: animal.eid,
        VID: animal.vid,
        Fecha: animal.fecha,
        "Peso 1": animal.peso1,
        "Peso 2": animal.peso2,
        Ganancia: animal.ganancia,
        "Ganancia diaria":
          animal.gananciaDiaria,
        Estado: animal.estado,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(datos);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Comparacion"
    );

    XLSX.writeFile(
      workbook,
      "resultado_pesajes.xlsx"
    );
  };

  const promedioGanancia =
    resultado.reduce(
      (acc, a) => acc + a.ganancia,
      0
    ) /
    (resultado.length || 1);

  return (
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <h1 className="title">
          Ganancia de Pesos
        </h1>

        <p className="subtitle">
          Control profesional de pesajes
        </p>
      </div>

      {/* UPLOADS */}
      <div className="upload-grid">

        {/* PESO 1 */}
        <div className="card">
          <h2 className="green">
            Archivo Peso 1
          </h2>

          <label className="file-upload green-border">

            <div>
              <p className="upload-title green">
                Seleccionar archivo
              </p>

              <p className="upload-subtitle">
                Excel, XLS o CSV
              </p>

              {nombrePeso1 && (
                <p className="file-name green">
                  ✓ {nombrePeso1}
                </p>
              )}
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) =>
                leerExcel(
                  e.target.files[0],
                  setPeso1,
                  setNombrePeso1
                )
              }
            />
          </label>
        </div>

        {/* PESO 2 */}
        <div className="card">
          <h2 className="cyan">
            Archivo Peso 2
          </h2>

          <label className="file-upload cyan-border">

            <div>
              <p className="upload-title cyan">
                Seleccionar archivo
              </p>

              <p className="upload-subtitle">
                Excel, XLS o CSV
              </p>

              {nombrePeso2 && (
                <p className="file-name cyan">
                  ✓ {nombrePeso2}
                </p>
              )}
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) =>
                leerExcel(
                  e.target.files[0],
                  setPeso2,
                  setNombrePeso2
                )
              }
            />
          </label>
        </div>
      </div>

      {/* BOTONES */}
      <div className="buttons">

        <button
          onClick={compararPesajes}
          className="btn btn-green"
        >
          Comparar Pesajes
        </button>

        {resultado.length > 0 && (
          <button
            onClick={descargarExcel}
            className="btn btn-cyan"
          >
            Descargar Excel
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="stats">

        <div className="stat-card stat-green">
          <p>Total animales</p>

          <h2 className="stat-number">
            {resultado.length}
          </h2>
        </div>

        <div className="stat-card stat-cyan">
          <p>Ganancia promedio</p>

          <h2 className="stat-number">
            {promedioGanancia.toFixed(
              2
            )} kg
          </h2>
        </div>

        <div className="stat-card stat-purple">
          <p>Mejor estado</p>

          <h2 className="stat-number">
            Excelente
          </h2>
        </div>

        <div className="stat-card stat-orange">
          <p>Sistema</p>

          <h2 className="stat-number">
            Online
          </h2>
        </div>
      </div>

      {/* GRAFICO */}
      <div className="card chart-card">
        <h2 className="chart-title">
          Ganancias del lote
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <BarChart
            data={resultado.slice(0, 20)}
          >
            <XAxis
              dataKey="eid"
              hide
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="ganancia"
              radius={[10, 10, 0, 0]}
              fill="#22c55e"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLA */}
      <div className="card table-card">

        <h2 className="table-title">
          Comparación de animales
        </h2>

        <div className="table-container">
          <table>

            <thead>
              <tr>
                <th>EID</th>
                <th>Peso 1</th>
                <th>Peso 2</th>
                <th>Ganancia</th>
                <th>Ganancia diaria</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {resultado.map(
                (animal, index) => (
                  <tr key={index}>

                    <td>
                      {animal.eid}
                    </td>

                    <td>
                      {animal.peso1} kg
                    </td>

                    <td>
                      {animal.peso2} kg
                    </td>

                    <td
                      className={
                        animal.ganancia >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {animal.ganancia} kg
                    </td>

                    <td className="cyan">
                      {
                        animal.gananciaDiaria
                      }{" "}
                      kg/día
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          animal.estado ===
                          "Excelente"
                            ? "badge-excelente"
                            : animal.estado ===
                              "Bueno"
                            ? "badge-bueno"
                            : animal.estado ===
                              "Normal"
                            ? "badge-normal"
                            : "badge-malo"
                        }`}
                      >
                        {animal.estado}
                      </span>
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}