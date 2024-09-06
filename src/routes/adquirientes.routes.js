import { Router } from "express";
import {
  createAdquiriente,
  deleteAdquirientes,
  getAdquiriente,
  getAdquirientes,
  updateAdquiriente,
} from "../controllers/adquirientes.controller.js";

const router = Router();

// GET all Materias
router.get("/adquirientes", getAdquirientes);

// GET An Materias
router.get("/adquirientes/:id", getAdquiriente);

// DELETE An Materias
router.delete("/adquirientes/:id", deleteAdquirientes);

// INSERT An Materias
router.post("/adquirientes", createAdquiriente);

router.patch("/adquirientes/:id", updateAdquiriente);

export default router;
