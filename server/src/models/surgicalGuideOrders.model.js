/**
 * @file surgicalGuideOrders.model.js
 * @description Surgical Guide Report data model with queries for PowerBI CP database
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */
import databaseService from '../services/database.js';

class SurgicalGuideOrdersModel {
  async getReportData({ startDate, endDate, page = 1, limit = 10, searchQuery = '', orderTypeFilter = 'all' }) {
    // Check if database is available
    if (!databaseService.isAvailable()) {
      throw new Error('Database service is not available. Please check database connection.');
    }

    // Default date range: 2014-01-01 to 2015-01-01
    const defaultStartDate = '2014-01-01';
    const defaultEndDate = '2015-01-01';
    const sanitizedStartDate = typeof startDate === 'string' && startDate.length === 10 ? startDate : defaultStartDate;
    const sanitizedEndDate = typeof endDate === 'string' && endDate.length === 10 ? endDate : defaultEndDate;
    const sanitizedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = Math.max(0, parseInt((sanitizedPage - 1) * sanitizedLimit, 10));
    
    // Convert date strings to Unix timestamps (seconds) for database comparison
    const startTimestamp = Math.floor(new Date(sanitizedStartDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(sanitizedEndDate + ' 23:59:59').getTime() / 1000);
    
    // Build search condition if searchQuery is provided
    const searchCondition = searchQuery ? `
      AND (
        sg.ID = ? OR
        o.dcmPatientName LIKE ? OR
        doctor.fullName LIKE ? OR
        scanCenter.fullName LIKE ?
      )
    ` : '';
    
    const searchParams = searchQuery ? [
      parseInt(searchQuery) || 0,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`
    ] : [];
    
    // Build order type filter condition using voucher_transaction data
    // Using transaction_amount from voucher_transaction (transaction_type = 1 means deduction)
    let orderTypeCondition = '';
    
    switch(orderTypeFilter) {
      case 'free':
        orderTypeCondition = 'AND sg.Cost = 0';
        break;
      case 'postpaid':
        orderTypeCondition = 'AND sg.Cost > 0';
        break;
      case 'fullyPrepaid':
        // Cost > 0 AND voucher amount >= cost (fully paid by vouchers)
        orderTypeCondition = 'AND sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) >= sg.Cost';
        break;
      case 'fullyPostpaid':
        // Cost > 0 AND no voucher payment (amount paid = 0)
        orderTypeCondition = 'AND sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) = 0';
        break;
      case 'partiallyPostpaid':
        // Cost > 0 AND 0 < voucher amount < cost (partial payment)
        orderTypeCondition = 'AND sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0 AND COALESCE(vt.totalVoucherAmount, 0) < sg.Cost';
        break;
      case 'vouchers':
        // Orders that used vouchers (fully or partially prepaid)
        orderTypeCondition = 'AND sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0';
        break;
      case 'rush':
        // Rush orders (isRush = 1) - Rush takes priority over all other workflow statuses
        orderTypeCondition = 'AND sg.isRush = 1';
        break;
      case 'onHold':
        // On Hold status - Only orders that are NOT Rush but have Q11_Val_4 set
        // Priority: Rush > On Hold > Confirmed > Active
        orderTypeCondition = 'AND sg.isRush != 1 AND sg.Q11_Val_4 IS NOT NULL AND sg.Q11_Val_4 != 0';
        break;
      case 'confirmed':
        // Confirmed status - Only orders that are NOT Rush, NOT On Hold, but have Q11_Val_2 set
        // Priority: Rush > On Hold > Confirmed > Active
        orderTypeCondition = 'AND sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND sg.Q11_Val_2 IS NOT NULL AND sg.Q11_Val_2 != 0';
        break;
      case 'active':
        // Active status - Only orders that are NOT Rush, NOT On Hold, NOT Confirmed, but have Q11_Val_1 set
        // Priority: Rush > On Hold > Confirmed > Active
        orderTypeCondition = 'AND sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND (sg.Q11_Val_2 IS NULL OR sg.Q11_Val_2 = 0) AND sg.Q11_Val_1 IS NOT NULL AND sg.Q11_Val_1 != 0';
        break;
      case 'all':
      default:
        orderTypeCondition = '';
    }
    
    // Optimized query: Join with UserAcounts to get doctor, scan center, and designer names
    // Use subquery for voucher amounts to avoid expensive many-to-many JOIN on main query
    const dataQuery = `
        SELECT
          sg.ID AS orderSGID,
          o.dcmPatientName AS patientName,
          sg.Cost AS cost,
          COALESCE(vt.totalVoucherAmount, 0) AS amountPaid,
          vt.voucherDetails AS voucherDetails,
          sg.Type AS type,
          sg.dateSent AS createdTime,
          sg.designedOn AS designTime,
          o.TimeBilled AS chargeTime,
          sg.designer AS designerID,
          designer.fullName AS designerName,
          sg.hasExtraction AS extracted,
          sg.extComp_BoneReduction_selected AS boneReduction,
          sg.Q1_Val AS typeOfSupport,
          sg.isRush AS isRush,
          sg.Q11_Val_1 AS Q11_Val_1,
          sg.Q11_Val_2 AS Q11_Val_2,
          sg.Q11_Val_4 AS Q11_Val_4,
          doctor.fullName AS doctorFullName,
          scanCenter.fullName AS scanCenterFullName
        FROM OrderSG sg
        LEFT JOIN Orders o ON o.SGID = sg.ID
        LEFT JOIN UserAcounts doctor ON o.DocID = doctor.uID
        LEFT JOIN UserAcounts scanCenter ON o.ScanID = scanCenter.uID
        LEFT JOIN UserAcounts designer ON sg.designer = designer.uID
        LEFT JOIN (
          SELECT 
            sub_order_id, 
            SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount,
            GROUP_CONCAT(
              CONCAT(voucher_id, ':', transaction_amount) 
              ORDER BY transaction_time 
              SEPARATOR '|'
            ) as voucherDetails
          FROM voucher_transaction
          WHERE transaction_type = 1
          GROUP BY sub_order_id
        ) vt ON vt.sub_order_id = sg.ID
        WHERE sg.dateSent >= ? AND sg.dateSent <= ?
        ${searchCondition}
        ${orderTypeCondition}
        ORDER BY sg.dateSent DESC
        LIMIT ${sanitizedLimit} OFFSET ${offset}
      `;
    const countQuery = `
      SELECT COUNT(DISTINCT sg.ID) as total
      FROM OrderSG sg
      LEFT JOIN Orders o ON o.SGID = sg.ID
      LEFT JOIN UserAcounts doctor ON o.DocID = doctor.uID
      LEFT JOIN UserAcounts scanCenter ON o.ScanID = scanCenter.uID
      LEFT JOIN (
        SELECT sub_order_id, SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount
        FROM voucher_transaction
        WHERE transaction_type = 1
        GROUP BY sub_order_id
      ) vt ON vt.sub_order_id = sg.ID
      WHERE sg.dateSent >= ? AND sg.dateSent <= ?
      ${searchCondition}
      ${orderTypeCondition}
    `;
    let data, countResult;
    try {
      [data, countResult] = await Promise.all([
        databaseService.query(dataQuery, [startTimestamp, endTimestamp, ...searchParams]),
        databaseService.query(countQuery, [startTimestamp, endTimestamp, ...searchParams])
      ]);
    } catch (error) {
      // Enhance error with query context
      const enhancedError = new Error(`Database query failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.query = 'getReportData';
      enhancedError.startDate = sanitizedStartDate;
      enhancedError.endDate = sanitizedEndDate;
      throw enhancedError;
    }
    
    // Validate query results
    if (!countResult || countResult.length === 0) {
      throw new Error('Count query returned no results');
    }
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / sanitizedLimit);

    function formatDate(val) {
      if (!val) return '';
      if (!isNaN(val)) {
        const ts = Number(val);
        const date = ts > 1000000000000 ? new Date(ts) : new Date(ts * 1000);
        return date.toISOString().slice(0, 10);
      }
      return val;
    }

    function getTypeLabel(type) {
      switch (Number(type)) {
        case 0:
          return 'Simplant';
        case 3:
          return 'coDiagnostiX';
        case 4:
          return 'BSB';
        case 6:
          return 'Real Guide';
        case 7:
          return 'Implant Studio';
        default:
          return 'Not Specified';
      }
    }

    const mappedData = data.map(row => ({
      orderSGID: row.orderSGID,
      scanCenterFullName: row.scanCenterFullName && 
                          row.scanCenterFullName.trim() !== '' && 
                          row.scanCenterFullName !== 'None'
        ? row.scanCenterFullName 
        : 'Not Specified',
      doctorFullName: row.doctorFullName && 
                      row.doctorFullName.trim() !== '' && 
                      row.doctorFullName !== 'None'
        ? row.doctorFullName 
        : 'Not Specified',
      patientName: row.patientName || 'Unknown',
      cost: row.cost,
      amountPaid: parseFloat(row.amountPaid) || 0,
      vouchers: row.voucherDetails ? row.voucherDetails.split('|').map(v => {
        const [id, amount] = v.split(':');
        return { id, amount: parseFloat(amount) || 0 };
      }) : [],
      designer: row.designerName && 
                row.designerName.trim() !== '' && 
                row.designerName !== 'None'
        ? row.designerName 
        : (row.designerID ? `Designer #${row.designerID}` : 'Not Assigned'),
      createdTime: formatDate(row.createdTime),
      designTime: row.designTime && row.designTime !== 0 ? formatDate(row.designTime) : 'N/A',
      chargeTime: formatDate(row.chargeTime),
      extracted: row.extracted === 0 ? 'No' : 'Yes',
      boneReduction: row.boneReduction === 0 ? 'No' : 'Yes',
      typeOfSupport: row.typeOfSupport, // Support type numeric value (0=Teeth, 1=Tissue, 2=Bone)
      typeLabel: getTypeLabel(row.type),
      isRush: Number(row.isRush) || 0,
      Q11_Val_1: Number(row.Q11_Val_1) || 0,
      Q11_Val_2: Number(row.Q11_Val_2) || 0,
      Q11_Val_4: Number(row.Q11_Val_4) || 0,
  // vouchers: '' // Removed for performance
    }));
    return {
      data: mappedData,
      pagination: {
        page: sanitizedPage,
        limit: sanitizedLimit,
        total,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPrevPage: sanitizedPage > 1
      },
      sort: {
        field: 'created_time',
        order: 'DESC'
      }
    };
  }

  /**
   * Validate date range for queries
   */
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    return true;
  }

  /**
   * Get summary statistics with order type breakdown using voucher data
   */
  async getSummary(startDate, endDate) {
    try {
      // Check if database is available
      if (!databaseService.isAvailable()) {
        throw new Error('Database service is not available. Please check database connection.');
      }

      // Validate inputs
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required');
      }

      // Convert date strings to Unix timestamps (seconds) for database comparison
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate + ' 23:59:59').getTime() / 1000);
      
      // Validate timestamps
      if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      
      const query = `
        SELECT 
          COUNT(DISTINCT sg.ID) as totalOrders,
          SUM(CASE WHEN sg.Cost > 0 THEN 1 ELSE 0 END) as postpaidOrders,
          SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) >= sg.Cost THEN 1 ELSE 0 END) as fullyPrepaidOrders,
          SUM(CASE WHEN sg.Cost = 0 THEN 1 ELSE 0 END) as freeOrders,
          SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) = 0 THEN 1 ELSE 0 END) as fullyPostpaidOrders,
          SUM(CASE WHEN sg.Cost > 0 AND COALESCE(vt.totalVoucherAmount, 0) > 0 AND COALESCE(vt.totalVoucherAmount, 0) < sg.Cost THEN 1 ELSE 0 END) as partiallyPostpaidOrders,
          SUM(CASE WHEN sg.isRush = 1 THEN 1 ELSE 0 END) as rushOrders,
          SUM(CASE WHEN sg.isRush != 1 AND sg.Q11_Val_4 IS NOT NULL AND sg.Q11_Val_4 != 0 THEN 1 ELSE 0 END) as onHoldOrders,
          SUM(CASE WHEN sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND sg.Q11_Val_2 IS NOT NULL AND sg.Q11_Val_2 != 0 THEN 1 ELSE 0 END) as confirmedOrders,
          SUM(CASE WHEN sg.isRush != 1 AND (sg.Q11_Val_4 IS NULL OR sg.Q11_Val_4 = 0) AND (sg.Q11_Val_2 IS NULL OR sg.Q11_Val_2 = 0) AND sg.Q11_Val_1 IS NOT NULL AND sg.Q11_Val_1 != 0 THEN 1 ELSE 0 END) as activeOrders
        FROM OrderSG sg
        LEFT JOIN Orders o ON o.SGID = sg.ID
        LEFT JOIN (
          SELECT sub_order_id, SUM(COALESCE(transaction_amount, 0)) as totalVoucherAmount
          FROM voucher_transaction
          WHERE transaction_type = 1
          GROUP BY sub_order_id
        ) vt ON vt.sub_order_id = sg.ID
        WHERE sg.dateSent >= ? AND sg.dateSent <= ?
      `;

      let results;
      try {
        results = await databaseService.query(query, [startTimestamp, endTimestamp]);
      } catch (dbError) {
        // Enhance error with context
        const enhancedError = new Error(`Database query failed: ${dbError.message}`);
        enhancedError.originalError = dbError;
        enhancedError.query = 'getSummary';
        enhancedError.startDate = startDate;
        enhancedError.endDate = endDate;
        enhancedError.isDatabaseError = true;
        throw enhancedError;
      }
      
      // Handle case where query returns empty result
      if (!results || results.length === 0) {
        throw new Error('Summary query returned no results');
      }

      const summary = results[0];

      return {
        totalOrders: parseInt(summary.totalOrders) || 0,
        postpaidOrders: parseInt(summary.postpaidOrders) || 0,
        fullyPrepaidOrders: parseInt(summary.fullyPrepaidOrders) || 0,
        freeOrders: parseInt(summary.freeOrders) || 0,
        fullyPostpaidOrders: parseInt(summary.fullyPostpaidOrders) || 0,
        partiallyPostpaidOrders: parseInt(summary.partiallyPostpaidOrders) || 0,
        rushOrders: parseInt(summary.rushOrders) || 0,
        onHoldOrders: parseInt(summary.onHoldOrders) || 0,
        confirmedOrders: parseInt(summary.confirmedOrders) || 0,
        activeOrders: parseInt(summary.activeOrders) || 0
      };
    } catch (error) {
      // Enhance error with context
      const enhancedError = new Error(`Failed to get summary: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.startDate = startDate;
      enhancedError.endDate = endDate;
      throw enhancedError;
    }
  }

  /**
   * Export report data to CSV format with all lookup values
   */
  async exportToCSV(startDate, endDate) {
    const data = await this.getReportData({
      startDate,
      endDate,
      page: 1,
      limit: 100000 // Get all records for export
    });

    // Helper function to get support type label
    const getSupportTypeLabel = (typeValue) => {
      const typeMap = { 0: 'Teeth', 1: 'Tissue', 2: 'Bone' };
      return typeMap[typeValue] || 'N/A';
    };

    // Helper function to get status label
    const getStatusLabel = (row) => {
      const Q11_max = Math.max(
        row.Q11_Val_1 || 0,
        row.Q11_Val_2 || 0,
        row.Q11_Val_4 || 0
      );
      if (row.Q11_Val_2 > Q11_max) return 'Confirmed by OEM';
      if (row.Q11_Val_4 > Q11_max) return 'On Hold';
      if (row.Q11_Val_1 > Q11_max) return 'Active';
      return 'Inactive';
    };

    // Helper function to get payment status
    const getPaymentStatus = (row) => {
      const cost = parseFloat(row.cost || 0);
      const paid = parseFloat(row.amountPaid || 0);
      if (cost === 0) return 'Free Order';
      if (paid === 0) return 'Fully Postpaid';
      if (paid >= cost) return 'Fully Prepaid';
      return 'Partially Postpaid';
    };

    const headers = [
      'Order ID',
      'Scan Center',
      'Doctor',
      'Patient Name',
      'Type',
      'Status',
      'Rush Order',
      'Cost (USD)',
      'Voucher Payment (USD)',
      'Remaining Balance (USD)',
      'Payment Status',
      'Voucher IDs',
      'Created Date',
      'Designed Date',
      'Charged Date',
      'Designer',
      'Extraction',
      'Bone Reduction',
      'Support Type'
    ];

    const rows = data.data.map(row => {
      const cost = parseFloat(row.cost || 0);
      const paid = parseFloat(row.amountPaid || 0);
      const remaining = cost - paid;
      
      // Format voucher IDs and amounts
      const voucherList = row.vouchers && row.vouchers.length > 0
        ? row.vouchers.map(v => `${v.id}:$${v.amount.toFixed(2)}`).join('; ')
        : 'No Vouchers';

      return [
        row.orderSGID || '',
        row.scanCenterFullName || 'Not Specified',
        row.doctorFullName || 'Not Specified',
        row.patientName || 'Unknown',
        row.typeLabel || 'Not Specified',
        getStatusLabel(row),
        row.isRush === 1 ? 'Yes' : 'No',
        cost.toFixed(2),
        paid.toFixed(2),
        remaining.toFixed(2),
        getPaymentStatus(row),
        voucherList,
        row.createdTime || 'N/A',
        row.designTime || 'N/A',
        row.chargeTime || 'N/A',
        row.designer || 'Not Assigned',
        row.extracted || 'No',
        row.boneReduction || 'No',
        getSupportTypeLabel(row.typeOfSupport)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export default new SurgicalGuideOrdersModel();
