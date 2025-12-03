// ✅ backend/models/getModels.js
// This helper file makes it easy to use models with different database connections

const mongoose = require('mongoose');

// ✅ Item Model Schema
const getItemModel = (connection) => {
  if (connection.models.Item) {
    return connection.models.Item;
  }
  
  const itemSchema = new mongoose.Schema({
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    description: String,
    category: { 
      type: String, 
      enum: ['Raw Materials', 'Work in Progress', 'Finished Goods', 'Spare Parts', 'Packaging'] 
    },
    department: String,
    unit: String,
    quantity: { type: Number, default: 0 },
    reorderLevel: Number,
    supplier: String,
    unitPrice: Number,
    lastPurchaseDate: Date,
    lastUpdated: { type: Date, default: Date.now }
  });

  return connection.model('Item', itemSchema);
};

// ✅ Manufacturing Item Model Schema
const getManufacturingItemModel = (connection) => {
  if (connection.models.ManufacturingItem) {
    return connection.models.ManufacturingItem;
  }
  
  const manufacturingItemSchema = new mongoose.Schema({
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    department: { type: String, required: true },
    readyStock: { type: Number, default: 0 },
    wipStock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    lastUpdated: { type: Date, default: Date.now }
  });
  
  manufacturingItemSchema.virtual('totalStock').get(function() {
    return this.readyStock + this.wipStock;
  });
  
  return connection.model('ManufacturingItem', manufacturingItemSchema);
};

// ✅ Purchase Model Schema
const getPurchaseModel = (connection) => {
  if (connection.models.Purchase) {
    return connection.models.Purchase;
  }
  
  const purchaseSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    invoiceNo: { type: String, required: true, unique: true },
    itemCode: { type: String, required: true },
    partName: { type: String, required: true },
    quantity: { type: Number, required: true },
    addedBy: { type: String, default: "Admin" },
    manufacturingItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingItem' }
  });
  
  return connection.model('Purchase', purchaseSchema);
};

// ✅ Issue Model Schema
const getIssueModel = (connection) => {
  if (connection.models.Issue) {
    return connection.models.Issue;
  }
  
  const issueSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingItem', required: true },
    productName: { type: String, required: true },
    itemCode: { type: String, required: true },
    quantity: { type: Number, required: true },
    issuedTo: { type: String, required: true },
    workOrder: { type: String, required: true },
    machine: { type: String, required: true },
    date: { type: Date, required: true },
    issuedBy: { type: String, default: "Admin" },
    department: String,
    remarks: String,
    status: { type: String, enum: ['Issued', 'In Progress', 'Completed'], default: 'Issued' },
    createdAt: { type: Date, default: Date.now }
  });
  
  return connection.model('Issue', issueSchema);
};

// ✅ Dispatch Model Schema
const getDispatchModel = (connection) => {
  if (connection.models.Dispatch) {
    return connection.models.Dispatch;
  }
  
  const dispatchSchema = new mongoose.Schema({
    items: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      itemCode: { type: String, required: true },
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true }
    }],
    destination: { type: String, required: true },
    customerName: String,
    address: String,
    contactNumber: String,
    dispatchDate: { type: Date, required: true },
    deliveryDate: Date,
    transportMode: { type: String, default: "Road" },
    vehicleNumber: String,
    driverName: String,
    driverContact: String,
    dispatchedBy: { type: String, default: "Admin" },
    remarks: String,
    status: { type: String, enum: ['Dispatched', 'In Transit', 'Delivered', 'Cancelled'], default: 'Dispatched' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  dispatchSchema.virtual('totalQuantity').get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  
  dispatchSchema.virtual('totalItems').get(function() {
    return this.items.length;
  });
  
  return connection.model('Dispatch', dispatchSchema);
};

// ✅ Machine Model Schema
const getMachineModel = (connection) => {
  if (connection.models.Machine) {
    return connection.models.Machine;
  }
  
  const machineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String,
    department: String,
    components: [{ type: String }],
    materials: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' }
  });
  
  return connection.model('Machine', machineSchema);
};

// ✅ Production Models
const getProductionModels = (connection) => {
  const ProductionItem = connection.models.ProductionItem || connection.model('ProductionItem', new mongoose.Schema({
    workOrder: String,
    component: String,
    quantity: Number,
    processPath: [{
      process: String,
      machine: String,
      status: String,
      startTime: Date,
      pauseTime: Date,
      inProcessDuration: Number,
      pauseToNextDuration: Number
    }],
    currentProcessIndex: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }));
  
  const HaltDuration = connection.models.HaltDuration || connection.model('HaltDuration', new mongoose.Schema({
    workOrder: String,
    component: String,
    process: String,
    machine: String,
    haltStartTime: Date,
    haltEndTime: Date,
    haltDuration: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }));
  
  return { ProductionItem, HaltDuration };
};

// ✅ Export all model getters
module.exports = {
  getItemModel,
  getManufacturingItemModel,
  getPurchaseModel,
  getIssueModel,
  getDispatchModel,
  getMachineModel,
  getProductionModels
};