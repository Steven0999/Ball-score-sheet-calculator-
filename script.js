function processImage() {
  const file = document.getElementById("upload").files[0];
  if (!file) return alert("Please upload an image first.");

  document.getElementById("notification").style.display = "none";
  document.getElementById("loading").style.display = "block";

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById("preview");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Crop Team A (top-left side)
      const teamAImageData = ctx.getImageData(0, 160, 450, 240);
      const teamACanvas = document.createElement("canvas");
      teamACanvas.width = teamAImageData.width;
      teamACanvas.height = teamAImageData.height;
      teamACanvas.getContext("2d").putImageData(teamAImageData, 0, 0);

      // Crop Team B (bottom-left side)
      const teamBImageData = ctx.getImageData(0, 490, 450, 240);
      const teamBCanvas = document.createElement("canvas");
      teamBCanvas.width = teamBImageData.width;
      teamBCanvas.height = teamBImageData.height;
      teamBCanvas.getContext("2d").putImageData(teamBImageData, 0, 0);

      Promise.all([
        Tesseract.recognize(teamACanvas, 'eng'),
        Tesseract.recognize(teamBCanvas, 'eng')
      ]).then(([resultA, resultB]) => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("notification").style.display = "block";

        const teamAPlayers = parsePlayers(resultA.data.text);
        const teamBPlayers = parsePlayers(resultB.data.text);

        populateTable("teamA", teamAPlayers);
        populateTable("teamB", teamBPlayers);
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function parsePlayers(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const players = [];

  for (const line of lines) {
    const match = line.match(/^(\d{2,3})\s+([A-Z .'-]+)\s*(\d{1,2})?/i);
    if (match) {
      const number = match[1];
      const name = match[2].replace(/[^a-zA-Z .'-]/g, '').trim();
      const fouls = line.match(/X|F|1|2|3|4|5/g)?.length || 0;

      players.push({ number, name, fouls });
    }
  }

  return players;
}

function populateTable(id, players) {
  const tbody = document.getElementById(id).querySelector("tbody");
  tbody.innerHTML = "";
  for (const p of players) {
    const row = `<tr>
      <td contenteditable="true">${p.number}</td>
      <td contenteditable="true">${p.name}</td>
      <td contenteditable="true">${p.fouls}</td>
    </tr>`;
    tbody.innerHTML += row;
  }
}
