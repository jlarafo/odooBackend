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

export const createAdquiriente = async (req, res) => {
    try {
        const { documento, tipo, nombre, correo, direccion, fecha } = req.body;
        const [rows] = await pool.query(
            "INSERT INTO adquirientes (documento, tipo, nombre, correo, direccion, fecha) VALUES (?, ?, ?, ?, ?, ?)",
            [documento, tipo, nombre, correo, direccion, fecha]
        );

        // Configuración de la solicitud HTTP para /mail
        const mailOptions = {
            hostname: '3417-2800-484-788f-d600-d956-9a8a-f3bb-38b6.ngrok-free.app',
            //hostname: '192.168.0.19',
            //port: 5000,
            path: '/mail',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': 0, // Cambiar esto si necesitas enviar datos
            },
        };

        // Realiza la llamada a la API /mail solo si el INSERT fue exitoso
        const mailReq = https.request(mailOptions, (mailRes) => {
            if (mailRes.statusCode >= 200 && mailRes.statusCode < 300) {
                // Espera de 3 segundos antes de llamar a /crearadquiriente
                setTimeout(() => {
                    // Configuración de la solicitud HTTP para /crearadquiriente
                    const adquirienteOptions = {
                        hostname: '3417-2800-484-788f-d600-d956-9a8a-f3bb-38b6.ngrok-free.app',
                        //hostname: '192.168.0.19',
                        //port: 5000,
                        path: '/crearadquiriente',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': 0, // Cambiar esto si necesitas enviar datos
                        },
                    };

                    // Realiza la llamada a la API /crearadquiriente
                    const adquirienteReq = https.request(adquirienteOptions, (adquirienteRes) => {
                        adquirienteRes.on('data', (d) => {
                            process.stdout.write(d);
                        });
                    });

                    adquirienteReq.on('error', (error) => {
                        console.error(`Error al llamar a /crearadquiriente: ${error.message}`);
                    });

                    adquirienteReq.end();
                }, 3000); // 3000 milisegundos = 3 segundos
            }
        });

        mailReq.on('error', (error) => {
            console.error(`Error al llamar a /mail: ${error.message}`);
        });

        mailReq.end();

        res.status(201).json({ id: rows.insertId, documento, tipo, nombre, correo, direccion, fecha });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
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
