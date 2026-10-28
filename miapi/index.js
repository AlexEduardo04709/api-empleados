require('dotenv').config();require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión:', err));

// Modelo para la colección "Empleados" con los campos solicitados
const empleadoSchema = new mongoose.Schema({
  clave: { type: Number, required: true },
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  fechadenacimiento: { type: Date, required: true }, // Mongoose lo almacena como BSON Date
  sexo: { type: mongoose.Schema.Types.Mixed, required: true }, // Permite número (ej: 1) o texto (ej: "Masculino")
  tipodesangre: { type: String, required: true }
});

const Empleado = mongoose.model('Empleado', empleadoSchema, 'Empleados');

// ==========================
// MÉTODOS REST
// ==========================

// 1. GET: Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// 2. GET: Obtener un empleado por su ID de MongoDB
app.get('/api/empleados/:id', async (req, res) => {
  try {
    const empleado = await Empleado.findById(req.params.id);
    if (!empleado) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// 3. POST: Insertar un nuevo empleado desde Postman
app.post('/api/empleados', async (req, res) => {
  try {
    const nuevoEmpleado = new Empleado(req.body);
    const guardado = await nuevoEmpleado.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// 4. PUT: Actualizar un empleado existente por su ID
app.put('/api/empleados/:id', async (req, res) => {
  try {
    const actualizado = await Empleado.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!actualizado) return res.status(404).json({ mensaje: 'Empleado no encontrado para actualizar' });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// 5. DELETE: Eliminar un empleado por su ID
app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const eliminado = await Empleado.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Empleado no encontrado para eliminar' });
    res.json({ mensaje: 'Empleado eliminado exitosamente', eliminado });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));