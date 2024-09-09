import { pool } from "../db.js";

export const getAdquirientes= async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM adquirientes");
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" });
    }
};

export const getAdquiriente = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM adquirientes WHERE id = ?", [
            id,
        ]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Adquiriente not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" });
    }
};

export const deleteAdquirientes = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("DELETE FROM adquirientes WHERE id = ?", [id]);

        if (rows.affectedRows <= 0) {
            return res.status(404).json({ message: "adquiriente not found" });
        }

        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" });
    }
};

export const createAdquiriente = async (req, res) => {
    try {
        const { documento, tipo, nombre, correo, direccion, fecha } = req.body;
        const [rows] = await pool.query(
            "INSERT INTO adquirientes (documento, tipo, nombre, correo, direccion, fecha) VALUES (?, ?, ?, ?, ?, ?)",
            [ documento, tipo, nombre, correo, direccion, fecha]
        );
        res.status(201).json({ id: rows.insertId, documento, tipo, nombre, correo, direccion, fecha});

    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" });
    }
};

/*
export const createAdquiriente = async (req, res) => {
    try {
      const { documento, tipo, nombre, correo, direccion, fecha } = req.body;
      
      // Insertar registro en la base de datos
      const [rows] = await pool.query(
        "INSERT INTO adquirientes (documento, tipo, nombre, correo, direccion, fecha) VALUES (?, ?, ?, ?, ?, ?)",
        [documento, tipo, nombre, correo, direccion, fecha]
      );
  
      // Verificar si se insertó correctamente el registro
      if (rows.affectedRows > 0) {
        // Llamar a la API /mail
        await axios.post('http://192.168.0.19:5000/mail');
        
        // Llamar a la API /crearadquiriente
        await axios.post('http://192.168.0.19:5000/crearadquiriente');
      }
  
      // Enviar respuesta exitosa
      res.status(201).json({
        id: rows.insertId,
        documento,
        tipo,
        nombre,
        correo,
        direccion,
        fecha,
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Something goes wrong" });
    }
  };
*/
export const updateAdquiriente = async (req, res) => {
    try {
        const { id } = req.params;
        const { documento, tipo, nombre, correo, direccion, fecha } = req.body;

        const [result] = await pool.query(
            "UPDATE adquirientes SET documento = IFNULL(?, documento), tipo = IFNULL(?, tipo), nombre = IFNULL(?, nombre), correo = IFNULL(?, correo), direccion = IFNULL(?, direccion), fecha = IFNULL(?, fecha) WHERE id = ?",
            [documento, tipo, nombre, correo, direccion, fecha, id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Adquiriente not found" });

        const [rows] = await pool.query("SELECT * FROM adquirientes WHERE id = ?", [
            id,
        ]);

        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" });
    }
};
