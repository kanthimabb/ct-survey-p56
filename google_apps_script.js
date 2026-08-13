/**
 * Google Apps Script for Computational Thinking Survey Data Collector
 * 
 * วิธีใช้งาน:
 * 1. สร้าง Google Sheet ใหม่
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. วางโค้ดนี้ทั้งหมดลงในไฟล์ Code.gs (ลบโค้ดเดิมออกก่อน)
 * 4. กดปุ่มบันทึก 💾 (Save)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท (Select type): "เว็บแอป" (Web App)
 * 7. ตั้งค่าผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)
 * 8. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก Web App URL มาวางในปุ่มตั้งค่าของเว็บไซต์
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // สร้าง Header Column หากยังไม่มี
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp", "วันเวลาที่ตอบ", "เพศ", "ระดับชั้น", "เคยเรียนเขียนโปรแกรม", "แอปพลิเคชันที่เคยใช้"
      ];
      for (var i = 1; i <= 25; i++) {
        headers.push("ข้อ_" + i);
      }
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#dbeafe");
    }
    
    // แปลงข้อมูลที่ส่งมาเป็น JSON
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.timestamp || new Date().toISOString(),
      data.formattedDate || new Date().toLocaleString("th-TH"),
      data.gender || "",
      data.grade || "",
      data.experience || "",
      data.apps || ""
    ];
    
    // เติมคำตอบข้อ 1 ถึง 25
    for (var j = 1; j <= 25; j++) {
      var val = data.answers ? data.answers["q" + j] : "";
      row.push(val);
    }
    
    // เพิ่มแถวข้อมูลลง Sheet
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("CT Survey Collector Service is active.");
}
