export function downloadCertificate({ name, title, level, date }) {
  const c = document.createElement("canvas");
  c.width = 1600; c.height = 1130;
  const x = c.getContext("2d");
  x.fillStyle = "#fbf6ec"; x.fillRect(0, 0, 1600, 1130);
  x.strokeStyle = "#17140f"; x.lineWidth = 14; x.strokeRect(50, 50, 1500, 1030);
  x.lineWidth = 3; x.strokeRect(80, 80, 1440, 970);
  x.fillStyle = "#17140f"; x.textAlign = "center";
  x.font = "bold 40px Georgia, serif"; x.fillText("ENGLISH DAILY", 800, 190);
  x.font = "bold 92px Georgia, serif"; x.fillText("Certificate of Completion", 800, 340);
  x.font = "34px Georgia, serif"; x.fillText("This certifies that", 800, 450);
  x.font = "italic bold 84px Georgia, serif"; x.fillText(name || "Learner", 800, 570);
  x.fillStyle = "#ffc533"; x.fillRect(500, 600, 600, 8); x.fillStyle = "#17140f";
  x.font = "34px Georgia, serif";
  x.fillText("has successfully completed the " + title + " roadmap", 800, 700);
  x.fillText("at " + level + " level, practising English speaking every day.", 800, 750);
  x.font = "30px Georgia, serif"; x.fillText(date, 800, 930);
  x.font = "bold 28px Georgia, serif"; x.fillText("A little every day, no fear.", 800, 990);
  c.toBlob((b) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "english-daily-certificate.png"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
}
