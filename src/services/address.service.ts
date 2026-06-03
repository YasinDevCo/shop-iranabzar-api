import { Address, IAddress } from "../models/Address";

export class AddressService {
  static async getMyAddresses(userId: string) {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  static async getById(id: string, userId: string) {
    return Address.findOne({ _id: id, userId });
  }

  static async create(userId: string, data: Partial<IAddress>) {
    const count = await Address.countDocuments({ userId });
    const isDefault = count === 0 ? true : (data.isDefault || false);
    
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }
    
    return Address.create({ ...data, userId, isDefault });
  }

  static async update(id: string, userId: string, data: Partial<IAddress>) {
    if (data.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }
    return Address.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  }

  static async delete(id: string, userId: string) {
    const address = await Address.findOne({ _id: id, userId });
    if (!address) return null;
    
    const isDefault = address.isDefault;
    await Address.deleteOne({ _id: id, userId });
    
    if (isDefault) {
      const anotherAddress = await Address.findOne({ userId });
      if (anotherAddress) {
        await Address.updateOne({ _id: anotherAddress._id }, { isDefault: true });
      }
    }
    
    return address;
  }

  static async setDefault(id: string, userId: string) {
    await Address.updateMany({ userId }, { isDefault: false });
    return Address.findOneAndUpdate({ _id: id, userId }, { isDefault: true }, { new: true });
  }
}