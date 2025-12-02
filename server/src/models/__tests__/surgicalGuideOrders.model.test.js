import SurgicalGuideOrdersModel from '../surgicalGuideOrders.model.js';

describe('SurgicalGuideOrdersModel', () => {
  it('should have getReportData method', () => {
  expect(typeof SurgicalGuideOrdersModel.getReportData).toBe('function');
  });

  it('should have getSummary method', () => {
  expect(typeof SurgicalGuideOrdersModel.getSummary).toBe('function');
  });

  it('should have exportToCSV method', () => {
  expect(typeof SurgicalGuideOrdersModel.exportToCSV).toBe('function');
  });
});
