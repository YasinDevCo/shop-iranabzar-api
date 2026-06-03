import { Router } from "express";
import { protect } from "../middlewares/auth";
import { AddressController } from "../controllers/addressController";

const router = Router();

router.get("/", protect, AddressController.getMyAddresses);
router.get("/:id", protect, AddressController.getAddressById);
router.post("/", protect, AddressController.createAddress);
router.put("/:id", protect, AddressController.updateAddress);
router.delete("/:id", protect, AddressController.deleteAddress);
router.patch("/:id/default", protect, AddressController.setDefaultAddress);

export default router;