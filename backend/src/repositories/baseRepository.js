class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data, options = {}) {
    const doc = new this.model(data);
    await doc.save(options);
    return doc;
  }

  async findById(id, populateOptions = '') {
    let query = this.model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return await query;
  }

  async findOne(filter = {}, populateOptions = '') {
    let query = this.model.findOne(filter);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return await query;
  }

  async find(filter = {}, populateOptions = '', sortOptions = {}) {
    let query = this.model.find(filter);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    if (sortOptions) {
      query = query.sort(sortOptions);
    }
    return await query;
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
