import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh-TW' | 'vi' | 'id';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  'zh-TW': {
    // Top Bar
    'app.title': '連續爐收料重量總計系統',
    'app.tagline': '廠區進料過磅台',
    'app.subtag': 'HEAT TREATMENT FASTENER RECEIVING & SCALE WEIGHT AUDIT',
    'app.working': '作業中：{name}',
    'app.online3': '3台設備聯網在線',
    'app.sound.on': '開啟提示音效',
    'app.sound.off': '關閉提示音效',
    'app.scanQr': '掃描 QR Code',
    'app.receipt': '入庫磅單',
    'app.history': '過磅歷史',

    // Monitor Bar
    'monitor.title': '三台連續爐設備產出即時監控台',
    'monitor.badge': '3 台在線產出中',
    'monitor.desc': '現場 A爐、B爐、C爐 連續式滲碳爐同步產出，可自由切換過磅台作業，各設備獨立累計與核單',
    'monitor.network': '即時聯網：地磅 #01 / #02 / #03 正常連線',
    'monitor.currentWorkstation': '當前作業台',
    'monitor.switch': '切換',
    'monitor.enterScale': '進入過磅',
    'monitor.quickSim': '一鍵模擬此機台全部桶數',
    'monitor.cumWeight': '累計實磅 / 目標',
    'monitor.weighedBuckets': '已磅 {count} {expected}',
    'monitor.rate': '達成率 {percent}%',
    'monitor.exactMatch': '完全相符',
    'monitor.completeAndScan': '完成此單並掃描下一筆',
    'monitor.completeAndScanTooltip': '完成【{name}】目前這筆訂單並掃描下一筆',

    // Status
    'status.match': '合格允收',
    'status.overweight': '超重',
    'status.underweight': '待補足',
    'status.weighing': '過磅中',
    'status.pending': '待過磅',

    // Furnaces
    'furnace.eq1.name': 'A爐連續式滲碳爐',
    'furnace.eq1.short': 'A爐',
    'furnace.eq2.name': 'B爐連續式滲碳爐',
    'furnace.eq2.short': 'B爐',
    'furnace.eq3.name': 'C爐連續式滲碳爐',
    'furnace.eq3.short': 'C爐',

    // Order Info Card
    'order.loaded': '已成功讀取 QR Code 訂單資訊',
    'order.outputFurnace': '產出設備：{name}',
    'order.changeOrder': '換單 / 掃描',
    'order.reRead': '重新讀取',
    'order.noOrder': '尚未載入連續爐工單',
    'order.noOrderDesc': '請點擊掃描工單 QR Code 或選取示範工單',
    'order.field.date': '入貨日期',
    'order.field.customer': '客戶名稱',
    'order.field.batch': '熱處理工單編號',
    'order.field.spec': '螺絲規格品名',
    'order.field.treatment': '熱處理工藝',
    'order.field.expectedWeight': '應收進料重量',
    'order.field.expectedContainers': '預估總桶數',
    'order.field.tolerance': '允收容許差',
    'order.customTol': '自訂容差',
    'order.save': '儲存',
    'order.cancel': '取消',

    // Scale Input Panel
    'scale.title': '地磅儀表讀數直接鍵入',
    'scale.desc': '工業電子地磅讀數輸入 (小數點後1位，限輸入 .0 或 .5)',
    'scale.currentBucket': '目前進行：第 {num} 桶過磅',
    'scale.grossWeight': '毛重 Gross Weight',
    'scale.grossPlaceholder': '輸入磅秤儀表數值 (kg)',
    'scale.tareWeight': '空桶皮重 Tare Weight',
    'scale.netWeight': '實收淨重 Net Weight',
    'scale.quickPresets': '常見空桶皮重規格快捷選取：',
    'scale.preset.iron': '標準鐵桶',
    'scale.preset.midBoat': '中型船桶',
    'scale.preset.largeBoat': '大型船桶',
    'scale.preset.xlargeBoat': '特大型船桶',
    'scale.preset.none': '免扣重 (淨重直讀)',
    'scale.confirmAdd': '確認加入第 {num} 桶過磅記錄',
    'scale.resetZero': '歸零重設',
    'scale.quickValues': '快捷鍵入數值 (+kg)：',
    'scale.estCumulative': '本次入帳後累計淨重將達：{weight} kg',
    'scale.pleaseInputGross': '請輸入磅秤毛重數值',
    'scale.grossMustPositive': '毛重數值必須大於 0',
    'scale.tareCannotExceed': '空桶皮重 ({tare} kg) 不得大於等於毛重 ({gross} kg)',

    // Weight Comparison Card
    'comp.title': '收料重量加總與允收判定',
    'comp.subtitle': '依現場磅秤累積數據與工單規格對比分析',
    'comp.totalWeighed': '累計實磅淨重 (Net Total)',
    'comp.totalContainers': '共累計 {count} 桶',
    'comp.expectedWeight': '工單目標應收重量 (Target)',
    'comp.toleranceRange': '允收範圍：{min} ~ {max} kg (±{tol}%)',
    'comp.diffWeight': '重量差額 (Difference)',
    'comp.weightMatched': '完全相符 (±0 kg)',
    'comp.weightOver': '超出目標 +{diff} kg',
    'comp.weightUnder': '尚缺重量 {diff} kg',
    'comp.evalStandard': '判定依據：應收 {expected} kg (±{tol}%)',
    'comp.status.matchDesc': '實磅總重符合允收公差要求，可確認驗收入庫並完成此單。',
    'comp.status.overDesc': '實磅總重超出公差上限，請確認是否混料或空桶扣重不正確。',
    'comp.status.underDesc': '目前實磅總重低於公差下限，請確認是否漏秤桶數或進料不足。',
    'comp.status.weighingDesc': '過磅進行中，請依序過磅各桶，累計至目標重量進行最終判定。',
    'comp.status.pendingDesc': '請放置第一桶熱處理螺絲至地磅上並輸入毛重。',
    'comp.finishAndScanBtn': '合格完成！點此【存檔過磅單並掃描下一筆】',
    'comp.finishAndScanBtnProgress': '完成【{equipment}】此單並掃描下一筆',
    'comp.finishAndScanBtnEmpty': '結束此單並掃描下一筆資料',
    'comp.finishAndScanTip': '點擊後自動歸檔保存本筆熱處理收料磅單，並立即啟動 QR Code 掃描器進入下一單',

    // Weighing Log Table
    'table.title': '桶次過磅明細歷程',
    'table.subtitle': '每一桶熱處理螺絲毛重、皮重、淨重與累計明細',
    'table.simAll': '一鍵全單模擬',
    'table.clearAll': '清空此單',
    'table.confirmClear': '確定要清空目前所有過磅明細嗎？此動作無法復原。',
    'table.col.index': '序號',
    'table.col.time': '過磅時間',
    'table.col.container': '容器規格',
    'table.col.gross': '毛重 (Gross)',
    'table.col.tare': '扣皮重 (Tare)',
    'table.col.net': '單桶淨重 (Net)',
    'table.col.cum': '累計淨重 (Total)',
    'table.col.action': '操作',
    'table.empty': '目前尚無過磅紀錄，請使用上方鍵盤輸入第一桶磅秤數值',
    'table.summary': '累計過磅：{count} 桶 | 總淨重：{weight} kg | 目標達成率：{rate}%',

    // QR Modal
    'qr.modalTitle': '掃描 / 載入連續爐螺絲訂單',
    'qr.targetEq': '指定設備：{name}',
    'qr.targetEqDesc': '完成上一筆過磅，請為【{name}】掃描或載入下一筆工單資料',
    'qr.tab.camera': '相機掃描',
    'qr.tab.upload': '上傳圖片',
    'qr.tab.samples': '示範工單',
    'qr.tab.sticker': '列印工單貼紙',
    'qr.camera.prompt': '請將手機/平板相機對準工單上的 QR Code',
    'qr.samples.hint': '為方便現場測試，點選任一常用熱處理進料單即可載入作業：',
    'qr.loadOrder': '載入此訂單',
    'qr.close': '關閉視窗',

    // Summary Modal (Print Slip)
    'slip.modalTitle': '連續爐螺絲收料重量總計驗收單',
    'slip.printBtn': '列印磅單 (Print)',
    'slip.saveBtn': '僅保存存檔',
    'slip.back': '返回系統',
    'slip.orderNo': '單號：{id}',
    'slip.equipment': '產出設備：{name}',
    'slip.scale': '檢驗磅台：電子地磅',
    'slip.printTime': '列印時間：{time}',
    'slip.sign.inspector': '驗收人員簽章',
    'slip.sign.driver': '進料司機/外協簽章',
    'slip.sign.supervisor': '現場主管核可',

    // History Modal
    'history.modalTitle': '歷史過磅紀錄審計存檔',
    'history.modalDesc': '查看過去完成核算之連續爐螺絲收料工單',
    'history.exportCsv': '匯出 Excel (CSV)',
    'history.clearAll': '清空歷史紀錄',
    'history.empty': '目前暫無已保存的過磅歷史記錄',
    'history.viewDetail': '調閱此單',

    // Footer
    'footer.text': '連續爐收料重量總計系統 • 三台設備同步產出監控 • FASTENER SCALE VERIFICATION',
    'footer.subtext': '相容各式工業磅秤儀表數值輸入 • 一鍵完成並掃描下一筆',

    // Toasts
    'toast.loadedOrder': '已成功為設備載入工單：{customer} ({id})',
    'toast.saved': '已成功保存【{name}】收料過磅存檔！',
    'toast.completedAndScan': '已完成【{name}】工單過磅並存檔！請立即掃描下一筆工單。',
    'toast.readyToScan': '已為【{name}】開啟掃描器，請載入下一筆工單。',
    'toast.simulated': '已為【{name}】模擬完成整單過磅！判定：符合重量',
  },

  'vi': {
    // Top Bar
    'app.title': 'Hệ Thống Tổng Trọng Lượng Nhận Hàng Lò Liên Tục',
    'app.tagline': 'Bàn Cân Nhận Liệu Nhà Xưởng',
    'app.subtag': 'KIỂM TOÁN CÂN & TIẾP NHẬN BU LÔNG XỬ LÝ NHIỆT',
    'app.working': 'Đang thao tác: {name}',
    'app.online3': '3 thiết bị trực tuyến kết nối',
    'app.sound.on': 'Bật âm thanh',
    'app.sound.off': 'Tắt âm thanh',
    'app.scanQr': 'Quét QR Code',
    'app.receipt': 'Phiếu Cân Nhập Kho',
    'app.history': 'Lịch Sử Cân',

    // Monitor Bar
    'monitor.title': 'Bảng Giám Sát Thời Gian Thực 3 Lò Liên Tục',
    'monitor.badge': '3 lò đang sản xuất',
    'monitor.desc': 'Lò A, Lò B, Lò C thấm cacbon liên tục sản xuất đồng thời, tự do chuyển đổi bàn cân, tích lũy & kiểm tra độc lập',
    'monitor.network': 'Kết nối mạng: Cân sàn #01 / #02 / #03 bình thường',
    'monitor.currentWorkstation': 'Bàn cân hiện tại',
    'monitor.switch': 'Chuyển',
    'monitor.enterScale': 'Vào bàn cân',
    'monitor.quickSim': 'Mô phỏng nhanh toàn bộ thùng lò này',
    'monitor.cumWeight': 'Thực cân tích lũy / Mục tiêu',
    'monitor.weighedBuckets': 'Đã cân {count} {expected}',
    'monitor.rate': 'Tỷ lệ đạt {percent}%',
    'monitor.exactMatch': 'Hoàn toàn khớp',
    'monitor.completeAndScan': 'Hoàn thành đơn này & quét đơn tiếp theo',
    'monitor.completeAndScanTooltip': 'Hoàn thành đơn hàng hiện tại của 【{name}】 và quét đơn tiếp theo',

    // Status
    'status.match': 'Đạt chuẩn chấp nhận',
    'status.overweight': 'Quá tải (Thừa cân)',
    'status.underweight': 'Thiếu cân (Chờ bổ sung)',
    'status.weighing': 'Đang cân',
    'status.pending': 'Chờ cân',

    // Furnaces
    'furnace.eq1.name': 'Lò A Thấm Cacbon Liên Tục',
    'furnace.eq1.short': 'Lò A',
    'furnace.eq2.name': 'Lò B Thấm Cacbon Liên Tục',
    'furnace.eq2.short': 'Lò B',
    'furnace.eq3.name': 'Lò C Thấm Cacbon Liên Tục',
    'furnace.eq3.short': 'Lò C',

    // Order Info Card
    'order.loaded': 'Đã đọc thành công thông tin đơn hàng QR Code',
    'order.outputFurnace': 'Thiết bị sản xuất: {name}',
    'order.changeOrder': 'Đổi đơn / Quét',
    'order.reRead': 'Đọc lại',
    'order.noOrder': 'Chưa tải công đơn lò liên tục',
    'order.noOrderDesc': 'Vui lòng nhấn quét mã QR công đơn hoặc chọn đơn mẫu',
    'order.field.date': 'Ngày nhập hàng',
    'order.field.customer': 'Tên khách hàng',
    'order.field.batch': 'Số công đơn xử lý nhiệt',
    'order.field.spec': 'Quy cách bu lông',
    'order.field.treatment': 'Quy trình xử lý nhiệt',
    'order.field.expectedWeight': 'Trọng lượng nhận dự kiến',
    'order.field.expectedContainers': 'Dự tính số thùng',
    'order.field.tolerance': 'Dung sai cho phép',
    'order.customTol': 'Tùy chỉnh',
    'order.save': 'Lưu',
    'order.cancel': 'Hủy',

    // Scale Input Panel (vi)
    'scale.title': 'Nhập Trực Tiếp Số Đo Đồng Hồ Cân',
    'scale.desc': 'Nhập số đo cân điện tử (1 chữ số thập phân, chỉ nhận .0 hoặc .5)',
    'scale.currentBucket': 'Hiện tại đang cân: Thùng thứ {num}',
    'scale.grossWeight': 'Trọng lượng thô (Gross Weight)',
    'scale.grossPlaceholder': 'Nhập số đo đồng hồ cân (kg)',
    'scale.tareWeight': 'Bì thùng rỗng (Tare Weight)',
    'scale.netWeight': 'Trọng lượng tịnh thực tế (Net Weight)',
    'scale.quickPresets': 'Chọn nhanh quy cách bì thùng rỗng phổ biến:',
    'scale.preset.iron': 'Thùng sắt tiêu chuẩn',
    'scale.preset.midBoat': 'Thùng thuyền vừa',
    'scale.preset.largeBoat': 'Thùng thuyền lớn',
    'scale.preset.xlargeBoat': 'Thùng thuyền cực lớn',
    'scale.preset.none': 'Không trừ bì (Đọc trực tiếp)',
    'scale.confirmAdd': 'Xác nhận thêm bản ghi cân thùng thứ {num}',
    'scale.resetZero': 'Đặt về 0',
    'scale.quickValues': 'Phím tắt cộng nhanh số đo (+kg):',
    'scale.estCumulative': 'Sau lần này tích lũy tịnh sẽ đạt: {weight} kg',
    'scale.pleaseInputGross': 'Vui lòng nhập số đo trọng lượng thô',
    'scale.grossMustPositive': 'Giá trị trọng lượng thô phải lớn hơn 0',
    'scale.tareCannotExceed': 'Bì thùng ({tare} kg) không được lớn hơn hoặc bằng trọng lượng thô ({gross} kg)',

    // Weight Comparison Card
    'comp.title': 'Tổng Trọng Lượng & Đánh Giá Đạt Chuẩn',
    'comp.subtitle': 'Phân tích đối chiếu số liệu cân thực tế với quy cách đơn hàng',
    'comp.totalWeighed': 'Tổng trọng lượng tịnh thực cân (Net Total)',
    'comp.totalContainers': 'Tổng cộng {count} thùng',
    'comp.expectedWeight': 'Trọng lượng mục tiêu đơn hàng (Target)',
    'comp.toleranceRange': 'Phạm vi cho phép: {min} ~ {max} kg (±{tol}%)',
    'comp.diffWeight': 'Chênh lệch trọng lượng (Difference)',
    'comp.weightMatched': 'Hoàn toàn khớp (±0 kg)',
    'comp.weightOver': 'Vượt mục tiêu +{diff} kg',
    'comp.weightUnder': 'Còn thiếu {diff} kg',
    'comp.evalStandard': 'Tiêu chuẩn: Cần nhận {expected} kg (±{tol}%)',
    'comp.status.matchDesc': 'Tổng thực cân đạt chuẩn dung sai cho phép, có thể xác nhận nhập kho và hoàn thành đơn.',
    'comp.status.overDesc': 'Tổng thực cân vượt quá giới hạn trên, vui lòng kiểm tra xem có lẫn hàng hoặc sai trừ bì không.',
    'comp.status.underDesc': 'Hiện tại tổng thực cân dưới giới hạn dưới, vui lòng kiểm tra xem có sót thùng chưa cân không.',
    'comp.status.weighingDesc': 'Đang tiến hành cân, vui lòng cân lần lượt từng thùng cho đến khi đạt trọng lượng mục tiêu.',
    'comp.status.pendingDesc': 'Vui lòng đặt thùng bu lông đầu tiên lên cân sàn và nhập trọng lượng thô.',
    'comp.finishAndScanBtn': 'Đạt chuẩn! Nhấn 【Lưu phiếu cân & quét đơn tiếp theo】',
    'comp.finishAndScanBtnProgress': 'Hoàn thành đơn 【{equipment}】 & quét đơn tiếp',
    'comp.finishAndScanBtnEmpty': 'Kết thúc đơn này & quét dữ liệu tiếp theo',
    'comp.finishAndScanTip': 'Nhấn để tự động lưu hồ sơ phiếu cân tiếp nhận và khởi động ngay máy quét QR Code cho đơn tiếp theo',

    // Weighing Log Table
    'table.title': 'Lịch Sử Chi Tiết Từng Lần Cân Thùng',
    'table.subtitle': 'Chi tiết trọng lượng thô, trừ bì, trọng lượng tịnh và tích lũy từng thùng',
    'table.simAll': 'Mô phỏng cả đơn',
    'table.clearAll': 'Xóa đơn này',
    'table.confirmClear': 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu cân hiện tại không? Thao tác này không thể hoàn tác.',
    'table.col.index': 'STT',
    'table.col.time': 'Thời gian',
    'table.col.container': 'Loại thùng',
    'table.col.gross': 'Thô (Gross)',
    'table.col.tare': 'Bì (Tare)',
    'table.col.net': 'Tịnh thùng (Net)',
    'table.col.cum': 'Tích lũy (Total)',
    'table.col.action': 'Thao tác',
    'table.empty': 'Chưa có bản ghi cân nào, vui lòng dùng bảng nhập phía trên để nhập thùng đầu tiên',
    'table.summary': 'Đã cân: {count} thùng | Tổng tịnh: {weight} kg | Tỷ lệ hoàn thành: {rate}%',

    // QR Modal
    'qr.modalTitle': 'Quét / Tải Đơn Hàng Bu Lông Lò Liên Tục',
    'qr.targetEq': 'Thiết bị chỉ định: {name}',
    'qr.targetEqDesc': 'Đã hoàn thành đơn trước, vui lòng quét hoặc tải công đơn tiếp theo cho 【{name}】',
    'qr.tab.camera': 'Quét Camera',
    'qr.tab.upload': 'Tải ảnh mã vạch',
    'qr.tab.samples': 'Đơn mẫu thử nghiệm',
    'qr.tab.sticker': 'In tem đơn thử nghiệm',
    'qr.camera.prompt': 'Hướng camera điện thoại/máy tính bảng vào mã QR trên công đơn',
    'qr.samples.hint': 'Để thuận tiện kiểm tra, chọn một trong các phiếu tiếp nhận thường dùng để nạp dữ liệu:',
    'qr.loadOrder': 'Tải đơn hàng này',
    'qr.close': 'Đóng cửa sổ',

    // Summary Modal (Print Slip)
    'slip.modalTitle': 'Phiếu Nghiệm Thu Tổng Trọng Lượng Nhận Hàng Bu Lông Lò Liên Tục',
    'slip.printBtn': 'In phiếu cân (Print)',
    'slip.saveBtn': 'Chỉ lưu vào hồ sơ',
    'slip.back': 'Quay lại hệ thống',
    'slip.orderNo': 'Số phiếu: {id}',
    'slip.equipment': 'Thiết bị sản xuất: {name}',
    'slip.scale': 'Bàn cân: Cân sàn điện tử',
    'slip.printTime': 'Thời gian in: {time}',
    'slip.sign.inspector': 'Chữ ký người nghiệm thu',
    'slip.sign.driver': 'Chữ ký lái xe / Nhà gia công',
    'slip.sign.supervisor': 'Chữ ký quản lý hiện trường',

    // History Modal
    'history.modalTitle': 'Lưu Trữ Hồ Sơ Lịch Sử Cân Nghiệm Thu',
    'history.modalDesc': 'Xem lại các công đơn tiếp nhận lò liên tục đã hoàn thành',
    'history.exportCsv': 'Xuất Excel (CSV)',
    'history.clearAll': 'Xóa toàn bộ lịch sử',
    'history.empty': 'Hiện chưa có bản ghi lịch sử cân nào được lưu',
    'history.viewDetail': 'Xem lại đơn này',

    // Footer
    'footer.text': 'Hệ Thống Tổng Trọng Lượng Nhận Hàng Lò Liên Tục • Giám sát đồng thời 3 lò • FASTENER SCALE VERIFICATION',
    'footer.subtext': 'Tương thích nhập liệu từ nhiều đồng hồ cân công nghiệp • Hoàn thành 1 chạm & quét đơn tiếp theo',

    // Toasts
    'toast.loadedOrder': 'Đã tải thành công công đơn cho thiết bị: {customer} ({id})',
    'toast.saved': 'Đã lưu thành công hồ sơ cân tiếp nhận của 【{name}】!',
    'toast.completedAndScan': 'Đã hoàn thành cân và lưu hồ sơ công đơn 【{name}】! Hãy quét đơn tiếp theo.',
    'toast.readyToScan': 'Đã mở máy quét cho 【{name}】, vui lòng tải đơn tiếp theo.',
    'toast.simulated': 'Đã mô phỏng xong toàn bộ đơn cho 【{name}】! Đánh giá: Đạt chuẩn trọng lượng',
  },

  'id': {
    // Top Bar
    'app.title': 'Sistem Total Berat Penerimaan Tungku Kontinu',
    'app.tagline': 'Meja Timbang Masuk Pabrik',
    'app.subtag': 'AUDIT TIMBANGAN & PENERIMAAN BAUT PERLAKUAN PANAS',
    'app.working': 'Sedang aktif: {name}',
    'app.online3': '3 perangkat online terhubung',
    'app.sound.on': 'Nyalakan Suara',
    'app.sound.off': 'Matikan Suara',
    'app.scanQr': 'Scan QR Code',
    'app.receipt': 'Slip Timbang Masuk',
    'app.history': 'Riwayat Timbang',

    // Monitor Bar
    'monitor.title': 'Meja Pemantauan Real-Time Output 3 Tungku Kontinu',
    'monitor.badge': '3 unit berproduksi',
    'monitor.desc': 'Tungku A, B, C karburasi kontinu berproduksi serentak, bebas ganti meja timbang, akumulasi & verifikasi mandiri',
    'monitor.network': 'Koneksi jaringan: Timbangan lantai #01 / #02 / #03 normal',
    'monitor.currentWorkstation': 'Meja kerja saat ini',
    'monitor.switch': 'Pindah',
    'monitor.enterScale': 'Masuk meja timbang',
    'monitor.quickSim': 'Simulasi cepat semua wadah tungku ini',
    'monitor.cumWeight': 'Total Riil / Target',
    'monitor.weighedBuckets': 'Ditimbang {count} {expected}',
    'monitor.rate': 'Capaian {percent}%',
    'monitor.exactMatch': 'Tepat sesuai',
    'monitor.completeAndScan': 'Selesai pesanan ini & scan berikutnya',
    'monitor.completeAndScanTooltip': 'Selesaikan pesanan aktif 【{name}】 dan scan pesanan berikutnya',

    // Status
    'status.match': 'Lolos Standar',
    'status.overweight': 'Kelebihan Berat',
    'status.underweight': 'Kurang Berat',
    'status.weighing': 'Sedang Menimbang',
    'status.pending': 'Menunggu Timbang',

    // Furnaces
    'furnace.eq1.name': 'Tungku A Karburasi Kontinu',
    'furnace.eq1.short': 'Tungku A',
    'furnace.eq2.name': 'Tungku B Karburasi Kontinu',
    'furnace.eq2.short': 'Tungku B',
    'furnace.eq3.name': 'Tungku C Karburasi Kontinu',
    'furnace.eq3.short': 'Tungku C',

    // Order Info Card
    'order.loaded': 'Berhasil membaca informasi pesanan QR Code',
    'order.outputFurnace': 'Peralatan produksi: {name}',
    'order.changeOrder': 'Ganti Pesanan / Scan',
    'order.reRead': 'Baca Ulang',
    'order.noOrder': 'Belum memuat surat perintah kerja tungku kontinu',
    'order.noOrderDesc': 'Silakan klik scan QR Code pesanan kerja atau pilih contoh pesanan',
    'order.field.date': 'Tanggal Masuk',
    'order.field.customer': 'Nama Pelanggan',
    'order.field.batch': 'No. Surat Perintah Kerja',
    'order.field.spec': 'Spesifikasi & Nama Baut',
    'order.field.treatment': 'Proses Perlakuan Panas',
    'order.field.expectedWeight': 'Target Berat Masuk',
    'order.field.expectedContainers': 'Perkiraan Jumlah Wadah',
    'order.field.tolerance': 'Toleransi Diterima',
    'order.customTol': 'Kustom',
    'order.save': 'Simpan',
    'order.cancel': 'Batal',

    // Scale Input Panel (id)
    'scale.title': 'Input Langsung Angka Indikator Timbangan',
    'scale.desc': 'Input nilai timbangan (1 angka desimal, hanya boleh .0 atau .5)',
    'scale.currentBucket': 'Saat ini sedang menimbang: Wadah ke-{num}',
    'scale.grossWeight': 'Berat Kotor (Gross Weight)',
    'scale.grossPlaceholder': 'Masukkan angka timbangan (kg)',
    'scale.tareWeight': 'Tara Wadah Kosong (Tare Weight)',
    'scale.netWeight': 'Berat Bersih Riil (Net Weight)',
    'scale.quickPresets': 'Pilih cepat spesifikasi tara wadah kosong umum:',
    'scale.preset.iron': 'Ember Besi Standar',
    'scale.preset.midBoat': 'Bak Perahu Sedang',
    'scale.preset.largeBoat': 'Bak Perahu Besar',
    'scale.preset.xlargeBoat': 'Bak Perahu Ekstra Besar',
    'scale.preset.none': 'Tanpa Tara (Berat Bersih Langsung)',
    'scale.confirmAdd': 'Konfirmasi tambah catatan timbangan wadah ke-{num}',
    'scale.resetZero': 'Reset Nol',
    'scale.quickValues': 'Pintasan cepat tambah angka (+kg):',
    'scale.estCumulative': 'Setelah ini akumulasi bersih mencapai: {weight} kg',
    'scale.pleaseInputGross': 'Silakan masukkan angka berat kotor timbangan',
    'scale.grossMustPositive': 'Angka berat kotor harus lebih besar dari 0',
    'scale.tareCannotExceed': 'Tara wadah ({tare} kg) tidak boleh lebih besar atau sama dengan berat kotor ({gross} kg)',

    // Weight Comparison Card
    'comp.title': 'Akumulasi Berat & Penilaian Penerimaan',
    'comp.subtitle': 'Analisis perbandingan data timbangan lapangan dengan spesifikasi pesanan',
    'comp.totalWeighed': 'Total Berat Bersih Riil (Net Total)',
    'comp.totalContainers': 'Total {count} wadah',
    'comp.expectedWeight': 'Target Berat Pesanan (Target)',
    'comp.toleranceRange': 'Rentang diterima: {min} ~ {max} kg (±{tol}%)',
    'comp.diffWeight': 'Selisih Berat (Difference)',
    'comp.weightMatched': 'Tepat sesuai (±0 kg)',
    'comp.weightOver': 'Melebihi target +{diff} kg',
    'comp.weightUnder': 'Kurang berat {diff} kg',
    'comp.evalStandard': 'Standar: Target {expected} kg (±{tol}%)',
    'comp.status.matchDesc': 'Total berat riil memenuhi syarat toleransi, siap diverifikasi untuk masuk gudang dan selesaikan pesanan.',
    'comp.status.overDesc': 'Total berat riil melebihi batas atas toleransi, periksa apakah ada barang tercampur atau salah tara.',
    'comp.status.underDesc': 'Total berat riil di bawah batas bawah toleransi, periksa apakah ada wadah yang belum ditimbang.',
    'comp.status.weighingDesc': 'Penimbangan sedang berlangsung, timbang wadah satu per satu hingga mencapai target untuk evaluasi akhir.',
    'comp.status.pendingDesc': 'Silakan letakkan wadah baut pertama di atas timbangan lantai dan masukkan berat kotor.',
    'comp.finishAndScanBtn': 'Lolos Standar! Klik 【Simpan slip timbang & scan berikutnya】',
    'comp.finishAndScanBtnProgress': 'Selesaikan pesanan 【{equipment}】 & scan berikutnya',
    'comp.finishAndScanBtnEmpty': 'Selesaikan pesanan ini & scan data berikutnya',
    'comp.finishAndScanTip': 'Klik untuk otomatis mengarsipkan slip penerimaan dan segera membuka scanner QR Code untuk pesanan berikutnya',

    // Weighing Log Table
    'table.title': 'Riwayat Rincian Penimbangan per Wadah',
    'table.subtitle': 'Rincian berat kotor, tara, berat bersih, dan akumulasi per wadah baut',
    'table.simAll': 'Simulasi Seluruh Pesanan',
    'table.clearAll': 'Kosongkan Pesanan Ini',
    'table.confirmClear': 'Apakah Anda yakin ingin menghapus semua data penimbangan saat ini? Tindakan ini tidak dapat dibatalkan.',
    'table.col.index': 'No',
    'table.col.time': 'Waktu',
    'table.col.container': 'Jenis Wadah',
    'table.col.gross': 'Kotor (Gross)',
    'table.col.tare': 'Tara',
    'table.col.net': 'Bersih Wadah (Net)',
    'table.col.cum': 'Total Akumulasi',
    'table.col.action': 'Tindakan',
    'table.empty': 'Belum ada catatan penimbangan, gunakan panel input di atas untuk memasukkan wadah pertama',
    'table.summary': 'Ditimbang: {count} wadah | Total bersih: {weight} kg | Tingkat capaian: {rate}%',

    // QR Modal
    'qr.modalTitle': 'Scan / Muat Pesanan Baut Tungku Kontinu',
    'qr.targetEq': 'Unit yang ditentukan: {name}',
    'qr.targetEqDesc': 'Selesai menimbang sebelumnya, silakan scan atau muat surat perintah kerja berikutnya untuk 【{name}】',
    'qr.tab.camera': 'Scan Kamera',
    'qr.tab.upload': 'Unggah Gambar Barcode',
    'qr.tab.samples': 'Contoh Surat Pesanan',
    'qr.tab.sticker': 'Cetak Stiker Surat Uji',
    'qr.camera.prompt': 'Arahkan kamera ponsel/tablet ke QR Code pada surat perintah kerja',
    'qr.samples.hint': 'Untuk mempermudah pengujian di lapangan, klik salah satu surat jalan penerimaan untuk memuat:',
    'qr.loadOrder': 'Muat Pesanan Ini',
    'qr.close': 'Tutup',

    // Summary Modal (Print Slip)
    'slip.modalTitle': 'Slip Penerimaan Total Berat Baut Tungku Kontinu',
    'slip.printBtn': 'Cetak Slip Timbang (Print)',
    'slip.saveBtn': 'Hanya Simpan Arsip',
    'slip.back': 'Kembali ke Sistem',
    'slip.orderNo': 'No. Slip: {id}',
    'slip.equipment': 'Peralatan Produksi: {name}',
    'slip.scale': 'Meja Timbang: Timbangan Lantai Digital',
    'slip.printTime': 'Waktu Cetak: {time}',
    'slip.sign.inspector': 'Tanda Tangan Penerima',
    'slip.sign.driver': 'Tanda Tangan Pengemudi / Vendor',
    'slip.sign.supervisor': 'Persetujuan Pengawas Lapangan',

    // History Modal
    'history.modalTitle': 'Arsip Riwayat Audit Penimbangan',
    'history.modalDesc': 'Lihat pesanan penerimaan tungku kontinu yang telah selesai diverifikasi',
    'history.exportCsv': 'Ekspor Excel (CSV)',
    'history.clearAll': 'Hapus Semua Riwayat',
    'history.empty': 'Belum ada riwayat penimbangan tersimpan',
    'history.viewDetail': 'Buka Pesanan Ini',

    // Footer
    'footer.text': 'Sistem Total Berat Penerimaan Tungku Kontinu • Pemantauan serentak 3 unit • FASTENER SCALE VERIFICATION',
    'footer.subtext': 'Kompatibel dengan input dari berbagai indikator timbangan industri • Satu sentuhan selesai & scan berikutnya',

    // Toasts
    'toast.loadedOrder': 'Berhasil memuat surat perintah kerja untuk peralatan: {customer} ({id})',
    'toast.saved': 'Berhasil menyimpan arsip timbangan penerimaan 【{name}】!',
    'toast.completedAndScan': 'Berhasil menyelesaikan penimbangan & mengarsipkan 【{name}】! Silakan scan pesanan berikutnya.',
    'toast.readyToScan': 'Scanner telah dibuka untuk 【{name}】, silakan muat pesanan berikutnya.',
    'toast.simulated': 'Berhasil mensimulasikan penimbangan penuh untuk 【{name}】! Evaluasi: Sesuai Berat',
  }
};

const STORAGE_KEY_LANG = 'ht_screw_scale_lang_v1';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'zh-TW' || saved === 'vi' || saved === 'id') {
      return saved;
    }
    return 'zh-TW';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations['zh-TW'];
    let str = dict[key] || translations['zh-TW'][key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
