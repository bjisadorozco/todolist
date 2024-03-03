import React, { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const formStyle = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-blue-500 to-blue-500 from-[#2F80ED] to-[#1CB5E0]')`,
  container: `bg-slate-100 max-w-[1000px] w-full m-auto rounded-md shadow-xl p-4 max-h-[95vh] overflow-y-auto`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2`,
  form: `flex justify-between`,
  input: `border p-2 w-full text-xl`,
  button: `border p-4 ml-2 bg-green-400`,
  count: `text-center p-2`,
};

const taskStyle = {
  li: `flex justify-between bg-slate-200 p-4 my-2 capitalize`,
  liComplete: `flex justify-between bg-slate-400 p-4 my-2 capitalize`,
  row: `flex`,
  text: `ml-2 cursor-pointer`,
  textCompleta: `ml-2 cursor-pointer line-through`,
  button: `cursor-pointer flex-item-center`,
};

const Tarea = ({ tarea, tCompleta, eliminarTarea }) => {
  return (
    <li className={tarea.completed ? taskStyle.liComplete : taskStyle.li}>
      <div className={taskStyle.row}>
        <input
          onChange={() => tCompleta(tarea)}
          type="checkbox"
          checked={tarea.completed ? "cheked" : ""}
        />
        <p
          onClick={() => tCompleta(tarea)}
          className={tarea.completed ? taskStyle.textCompleta : taskStyle.text}
        >
          {tarea.text}
        </p>
      </div>
      <button onClick={() => eliminarTarea(tarea.id)}>
        {<FaRegTrashAlt />}
      </button>
    </li>
  );
};

function App() {
  const [tareas, setTareas] = useState([]);
  const [input, setInput] = useState("");

  const crearTarea = async (e) => {
    e.preventDefault(e);
    if (input === "") {
      alert("Por favor ingresa una tarea valida");
      return;
    }
    await addDoc(
      collection(db, "Tareas"),
      {
        text: input,
        completed: false,
      },
      setInput("")
    );
  };

  useEffect(() => {
    const ruta = query(collection(db, "Tareas"));
    const cancelacion = onSnapshot(ruta, (querySnapshot) => {
      let MatrizTareas = [];
      querySnapshot.forEach((doc) => {
        MatrizTareas.push({ ...doc.data(), id: doc.id });
      });
      setTareas(MatrizTareas);
    });
    return () => cancelacion();
  }, []);

  const tCompleta = async (tarea) => {
    await updateDoc(doc(db, "Tareas", tarea.id), {
      completed: !tarea.completed,
    });
  };

  const eliminarTarea = async (id) => {
    await deleteDoc(doc(db, "Tareas", id));
  };

  return (
    <div className={formStyle.bg}>
      <div className={formStyle.container}>
        <h3 className={formStyle.heading}>GESTION DE TAREAS</h3>
        <form onSubmit={crearTarea} className={formStyle.form}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={formStyle.input}
            type="text"
            placeholder="Agregar Tarea"
          ></input>
          <button className={formStyle.button}>
            <AiOutlinePlus size={30} />{" "}
          </button>
        </form>
        {tareas.length < 1 ? null : (
          <div
            className={`${formStyle.count} ${formStyle.heading} justify-center text-red-500 flex items-center`}
          >
            <FaExclamationCircle className="mr-1" />
            {`TIENES ${
              tareas.filter((tarea) => !tarea.completed).length
            } TAREAS PENDIENTES`}
            <FaExclamationCircle className="ml-1" />
          </div>
        )}
        <ul>
          {tareas.map((tarea, index) => (
            <Tarea
              key={index}
              tarea={tarea}
              tCompleta={tCompleta}
              eliminarTarea={eliminarTarea}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
