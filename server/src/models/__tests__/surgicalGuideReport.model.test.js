import SurgicalGuideReportModel from '../surgicalGuideReport.model.js';

describe('SurgicalGuideReportModel', () => {
  it('should have getReportData method', () => {
    expect(typeof SurgicalGuideReportModel.getReportData).toBe('function');
  });

  it('should have getSummary method', () => {
    expect(typeof SurgicalGuideReportModel.getSummary).toBe('function');
  });

  it('should have getDoctorBreakdown method', () => {
    expect(typeof SurgicalGuideReportModel.getDoctorBreakdown).toBe('function');
  });

  it('should have exportToCSV method', () => {
    expect(typeof SurgicalGuideReportModel.exportToCSV).toBe('function');
  });
});
