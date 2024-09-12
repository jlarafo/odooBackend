import { pool } from "../db.js";
import https from 'https'; // Cambiado de http a https para manejar URLs https

export const getAdquirientes = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM adquirientes");
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getAdquiriente = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM adquirientes WHERE id = ?", [id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Adquiriente not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteAdquirientes = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("DELETE FROM adquirientes WHERE id = ?", [id]);

        if (rows.affectedRows <= 0) {
            return res.status(404).json({ message: "Adquiriente not found" });
        }

        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};


const MAX_RETRIES = 3; // Número máximo de intentos para las solicitudes HTTP

// Función para realizar un intento con reintento
const performRequestWithRetry = (options, attempt = 1) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else if (attempt < MAX_RETRIES) {
        console.log(`Intento ${attempt} fallido, reintentando...`);
        setTimeout(() => resolve(performRequestWithRetry(options, attempt + 1)), 2000); // Reintentar después de 2 segundos
      } else {
        reject(new Error(`Request failed after ${MAX_RETRIES} attempts`));
      }
    });

    req.on('error', (error) => {
      if (attempt < MAX_RETRIES) {
        console.log(`Error: ${error.message}. Reintentando intento ${attempt + 1}`);
        setTimeout(() => resolve(performRequestWithRetry(options, attempt + 1)), 2000);
      } else {
        reject(new Error(`Request failed after ${MAX_RETRIES} attempts: ${error.message}`));
      }
    });

    req.end();
  });

export const createAdquiriente = async (req, res) => {
  const { documento, tipo, nombre, correo, direccion, fecha } = req.body;

  try {
    // Iniciar transacción
    await pool.query("START TRANSACTION");

    const [rows] = await pool.query(
      "INSERT INTO adquirientes (documento, tipo, nombre, correo, direccion, fecha) VALUES (?, ?, ?, ?, ?, ?)",
      [documento, tipo, nombre, correo, direccion, fecha]
    );

    // Configuración de la solicitud HTTP para /mail
    const mailOptions = {
      hostname: '0430-2800-484-788f-d600-6849-c465-cfeb-fafb.ngrok-free.app',
      path: '/mail',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
      },
    };

    // Realizar la llamada a /mail con reintento
    await performRequestWithRetry(mailOptions);

    // Esperar 4 segundos antes de realizar la llamada a /crearadquiriente
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Configuración de la solicitud HTTP para /crearadquiriente
    const adquirienteOptions = {
      hostname: '0430-2800-484-788f-d600-6849-c465-cfeb-fafb.ngrok-free.app',
      path: '/crearadquiriente',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
      },
    };

    // Realizar la llamada a /crearadquiriente con reintento
    await performRequestWithRetry(adquirienteOptions);

    // Confirmar transacción
    await pool.query("COMMIT");

    res.status(201).json({ id: rows.insertId, documento, tipo, nombre, correo, direccion, fecha });
  } catch (error) {
    // Revertir transacción si hay algún error
    await pool.query("ROLLBACK");
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

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

        const [rows] = await pool.query("SELECT * FROM adquirientes WHERE id = ?", [id]);

        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};
