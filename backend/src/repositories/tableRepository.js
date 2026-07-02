const BaseRepository = require('./baseRepository');
const Table = require('../models/Table');
const { TABLE_STATUS } = require('../config/constants');

class TableRepository extends BaseRepository {
  constructor() {
    super(Table);
  }

  /**
   * Find table by unique table number.
   * @param {string} tableNumber
   */
  async findByTableNumber(tableNumber) {
    return await this.model.findOne({ tableNumber }).lean();
  }

  /**
   * Find all tables currently marked as AVAILABLE.
   */
  async findAvailableTables() {
    return await this.model.find({ status: TABLE_STATUS.AVAILABLE }).lean();
  }

  /**
   * Find available tables that can accommodate a specific guest count.
   * @param {number} minCapacity
   */
  async findAvailableTablesByCapacity(minCapacity) {
    return await this.model
      .find({
        status: TABLE_STATUS.AVAILABLE,
        capacity: { $gte: minCapacity }
      })
      .sort({ capacity: 1 })
      .lean();
  }
}

module.exports = new TableRepository();
