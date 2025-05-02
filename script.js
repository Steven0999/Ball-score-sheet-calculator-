function processImage() {
  const file = document.getElementById("upload").files[0];
  if (!file) return alert("Please upload an image first.");

  document.getElementById("notification").style.display = "none";

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById("preview");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);

      document.getElementById("loading").style.display = "block";

      Tesseract.recognize(canvas, 'eng').then(({ data: { text } }) => {
        document.getElementById("loading").style.display = "none";
        parseScores(text);
        document.getElementById("notification").style.display = "block";
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function parseScores(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const teamA = [];
  const teamB = [];
  let currentTeam = 'A';

  for (const line of lines) {
    // Example format: "12 John Smith 14 F:2 T:1"
    const match = line.match(/^(\d{1,2})\s+([A-Za-z .'-]+)\s+(\d{1,2})\s+F:(\d{1,2})\s+T:(\d{1,2})$/);
    if (match) {
      const [_, number, name, points, fouls, technicals] = match;
      const player = {
        number,
        name: name.trim(),
        points,
        fouls,
        technicals
      };
      if (currentTeam === 'A') {
        teamA.push(player);
        if (teamA.length >= 5) currentTeam = 'B';
      } else {
        teamB.push(player);
      }
    }
  }

  populateTable("teamA", teamA);
  populateTable("teamB", teamB);
}

function populateTable(id, players) {
  const tbody = document.getElementById(id).querySelector("tbody");
  tbody.innerHTML = "";
  for (const p of players) {
    const row = `<tr>
      <td>${p.number}</td>
      <td>${p.name}</td>
      <td>${p.points}</td>
      <td>${p.fouls}</td>
      <td>${p.technicals}</td>
    </tr>`;
    tbody.innerHTML += row;
  }
}
