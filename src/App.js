import React, { useState, useEffect } from "react"; // Importa React y sus hooks useState y useEffect
import { AiOutlinePlus } from "react-icons/ai"; // Importa el icono Plus de React Icons
import { FaRegTrashAlt, FaCircle } from "react-icons/fa"; // Importa los iconos Trash y Circle de FontAwesome
import { FaExclamationCircle } from "react-icons/fa"; // Importa el icono Exclamation Circle de FontAwesome
import { db } from "./firebase"; // Importa la instancia de Firebase Firestore
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore"; // Importa funciones de Firebase Firestore

// Estilos para el formulario y las tareas
const formStyle = {
  // Estilos para el formulario
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-blue-500 to-blue-500 from-[#2F80ED] to-[#1CB5E0]')`,
  container: `bg-slate-100 max-w-[1000px] w-full m-auto rounded-md shadow-xl p-4 max-h-[95vh] overflow-y-auto`,
  container2: `bg-slate-100 max-w-[1000px] rounded-md shadow-xl p-4 h-[95vh] overflow-y-auto`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2`,
  form: `flex flex-col`,
  inputContainer: `flex mb-2`,
  input: `border p-2 w-full text-xl`,
  button: `border p-4 ml-2 bg-green-400`,
  count: `text-center p-2`,
};

// Estilos para las tareas
const taskStyle = {
  li: `flex justify-between bg-slate-200 p-4 my-2 capitalize`,
  liComplete: `flex justify-between bg-slate-400 p-4 my-2 capitalize`,
  row: `flex`,
  text: `ml-2 cursor-pointer`,
  textCompleta: `ml-2 cursor-pointer line-through`,
  button: `cursor-pointer flex-item-center`,
};

// Componente funcional para representar una tarea individual
const Tarea = ({ tarea, tCompleta, eliminarTarea, mostrarDetalle }) => {
  return (
    <li className={tarea.completed ? taskStyle.liComplete : taskStyle.li}>
      <div className={taskStyle.row} onClick={() => mostrarDetalle(tarea)}>
        <input
          onChange={() => tCompleta(tarea)}
          type="checkbox"
          checked={tarea.completed ? "checked" : ""}
        />
        <p
          className={tarea.completed ? taskStyle.textCompleta : taskStyle.text}
        >
          {tarea.title}
        </p>
      </div>
      <button onClick={() => eliminarTarea(tarea.id)}>
        {<FaRegTrashAlt />}
      </button>
    </li>
  );
};

// Componente principal de la aplicación
function App() {
  // Definición de estados para gestionar datos de la aplicación
  const [tareas, setTareas] = useState([]);
  const [input, setInputTarea] = useState("");
  const [descripcion, setInputDescripcion] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddTaskForm, setShowAddTaskForm] = useState(true);
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [categories, setCategories] = useState([]);

  // Efecto para cargar las categorías desde Firebase Firestore al cargar la aplicación
  useEffect(() => {
    const cancelacion = onSnapshot(collection(db, "Categorias"), (querySnapshot) => {
      let categorias = [];
      querySnapshot.forEach((doc) => {
        categorias.push({ id: doc.id, nombre: doc.data().nombre });
      });
      setCategories(categorias);
      // Si no hay ninguna categoría seleccionada y hay al menos una categoría disponible, selecciona la primera categoría
      if (!selectedCategory && categorias.length > 0) {
        setSelectedCategory(categorias[0]);
      }
    });
    return () => cancelacion();
  }, []);

  // Función para agregar una nueva categoría
  const agregarCategoria = async () => {
    const nuevaCategoria = prompt('Ingrese el nombre de la nueva categoría');
    if (nuevaCategoria) {
      await addDoc(collection(db, "Categorias"), { nombre: nuevaCategoria });
    }
  };

  // Función para eliminar una categoría
  const eliminarCategoria = async (id) => {
    await deleteDoc(doc(db, "Categorias", id));
  };

  // Función para crear una nueva tarea
  const crearTarea = async (e) => {
    e.preventDefault();
    if (input === "") {
      alert("Por favor ingresa una tarea válida");
      return;
    }
    await addDoc(
      collection(db, "Tareas"),
      {
        title: input,
        description: descripcion,
        completed: false,
        categoria: selectedCategory.nombre // Cambio category por categoria
      }
    );
    setInputTarea("");
    setInputDescripcion("");
  };

  // Efecto para cargar las tareas desde Firebase Firestore al cargar la aplicación
  useEffect(() => {
    const cancelacion = onSnapshot(collection(db, "Tareas"), (querySnapshot) => {
      let MatrizTareas = [];
      querySnapshot.forEach((doc) => {
        MatrizTareas.push({ ...doc.data(), id: doc.id });
      });
      setTareas(MatrizTareas);
      // Si hay tareas disponibles y no hay ninguna tarea seleccionada, establece la primera tarea como seleccionada
      if (MatrizTareas.length > 0 && !selectedTask) {
        setSelectedTask(MatrizTareas[0]);
        setInitialSelectionDone(true);
      }
    });
    return () => cancelacion();
  }, [initialSelectionDone]);

  // Efecto para seleccionar la primera tarea de la categoría seleccionada
  useEffect(() => {
    if (tareas.length > 0 && selectedCategory) {
      const primeraTareaCategoria = tareas.find(tarea => tarea.categoria === selectedCategory.nombre);
      if (primeraTareaCategoria) {
        setSelectedTask(primeraTareaCategoria);
      }
    }
  }, [tareas, selectedCategory]);

  // Función para marcar una tarea como completada
  const tCompleta = async (tarea) => {
    await updateDoc(doc(db, "Tareas", tarea.id), {
      completed: !tarea.completed,
    });
  };

  // Función para eliminar una tarea
  const eliminarTarea = async (id) => {
    await deleteDoc(doc(db, "Tareas", id));
  };

  // Función para mostrar los detalles de una tarea
  const mostrarDetalle = (tarea) => {
    setSelectedTask(tarea);
    setShowTaskDetails(true);
  };

  // Función para cambiar la categoría seleccionada
  const cambiarCategoria = (categoria) => {
    setSelectedCategory(categoria);
    setShowAddTaskForm(true);
    setShowTaskDetails(false);
  };

  // Renderizado de la interfaz de usuario de la aplicación
  return (
    <div className="flex">
      <div className="sidebar" style={{ backgroundColor: "#f0f0f0", padding: "10px", width: "200px" }}>
        {/* Listado de categorías */}
        <div className="flex justify-center items-center" style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "5px", marginBottom: "10px", textAlign: "center" }}>
          <h3 style={{ fontWeight: "bold", color: "#dc3545" }}>CATEGORIAS</h3>
        </div>
        <ul style={{ listStyleType: "none", padding: "0", marginTop: "-10px" }}>
          {/* Mapeo de categorías */}
          {categories.map((categoria) => (
            <li key={categoria.id} style={{ marginTop: "5px" }}>
              {/* Botón de categoría */}
              <button
                onClick={() => cambiarCategoria(categoria)}
                className={categoria.id === selectedCategory.id ? 'active' : ''}
                style={{ 
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor: categoria.id === selectedCategory.id ? '#2F80ED' : '#fff',
                  color: categoria.id === selectedCategory.id ? '#fff' : '#000',
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {/* Nombre de la categoría */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaCircle style={{ marginRight: "5px", color: categoria.id === selectedCategory.id ? '#fff' : '#2F80ED' }} />
                  {categoria.nombre}
                </div>
                {/* Icono de eliminar categoría */}
                <button onClick={(e) => {
                  e.stopPropagation();
                  eliminarCategoria(categoria.id);
                }}>
                  {<FaRegTrashAlt />}
                </button>
              </button>
            </li>
          ))}
        </ul>
        {/* Botón para agregar una nueva categoría */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={agregarCategoria} style={{ backgroundColor: "#2F80ED", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>Agregar Categoría</button>
        </div>
        {/* Contador de tareas pendientes */}
        {tareas.length > 0 && (
          <div
            className={`${formStyle.count} ${formStyle.heading} justify-center text-red-500 flex items-center`}
            style={{ marginTop: "20px", backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "5px", boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)" }}
          >
            <FaExclamationCircle style={{ marginRight: "5px", color: "#dc3545", marginTop: "1px" }} />
            <div style={{ fontSize: "14px", color: "#dc3545", marginTop: "1px" }}>
              {`${
                tareas.filter((tarea) => tarea.categoria === selectedCategory.nombre && !tarea.completed).length // Cambio category por categoria
              } Pendientes`}
            </div>
            <FaExclamationCircle style={{ marginLeft: "5px", color: "#dc3545", marginTop: "1px" }} />
          </div>
        )}
      </div>
      <div className={formStyle.bg} style={{ flex: "2" }}>
        <div className={formStyle.container}>
          {/* Encabezado de la lista de tareas */}
          <h3 className={formStyle.heading}>
            GESTION DE TAREAS - {selectedCategory.nombre}
          </h3>
          {/* Formulario para agregar una nueva tarea */}
          {showAddTaskForm && (
            <form onSubmit={crearTarea} className={formStyle.form}>
              <div className={formStyle.inputContainer}>
                <input
                  value={input}
                  onChange={(e) => setInputTarea(e.target.value)}
                  className={formStyle.input}
                  type="text"
                  placeholder="Agregar Tarea"
                />
              </div>
              <div className={formStyle.inputContainer}>
                <textarea
                  value={descripcion}
                  onChange={(e) => setInputDescripcion(e.target.value)}
                  className={formStyle.input}
                  type="text"
                  placeholder="Agregar Descripción"
                />
                <button type="submit" className={formStyle.button}>
                  <AiOutlinePlus size={30} />{" "}
                </button>
              </div>
            </form>
          )}
          {/* Lista de tareas */}
          <ul>
            {tareas
              .filter((tarea) => tarea.categoria === selectedCategory.nombre)
              .map((tarea, index) => (
                <Tarea
                  key={index}
                  tarea={tarea}
                  tCompleta={tCompleta}
                  eliminarTarea={eliminarTarea}
                  mostrarDetalle={mostrarDetalle}
                />
              ))}
          </ul>
        </div>
      </div>
      <div
        className="sidebar"
        style={{ backgroundColor: "#2F80ED", padding: "10px", flex: "1" }}
      >
        <div className={formStyle.container2}>
          {/* Encabezado de los detalles de la tarea */}
          <h3 className={formStyle.heading}>
            DETALLES DE LA TAREA
          </h3>
          {/* Detalles de la tarea seleccionada */}
          {showTaskDetails && selectedTask && (
            <div className="detalles-tarea">
              {/* Detalles de la tarea */}
              <div className="subcontainer bg-slate-200 p-4 rounded-md">
                <h4 style={{ fontWeight: "bold" }}>Título:</h4>
                <p>{selectedTask.title}</p>
              </div>
              <div className="subcontainer bg-slate-200 p-4 rounded-md mt-4">
                <h4 style={{ fontWeight: "bold" }}>Descripción:</h4>
                <p>{selectedTask.description}</p>
              </div>
              <div className="subcontainer bg-slate-200 p-4 rounded-md mt-4">
                <h4 style={{ fontWeight: "bold" }}>Estado:</h4>
                <p>
                  {selectedTask.completed ? "Completada" : "No completada"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
