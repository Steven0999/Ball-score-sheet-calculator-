function processImage() {
  const file = document.getElementById("upload").files[0];
  if (!file) return alert("Please upload an image first.");

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
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function parseScores(text) {
  // Basic placeholder logic - depends on actual format of scoresheet
  // Example parsing logic
  const lines = text.split("\n").filter(line => /\d{1,2}/.test(line));
  const teamA = [];
  const teamB = [];

  for (const line of lines) {
    const match = line.match(/(\d+)\s+([A-Za-z ]+)\s+(\d+)\s+F:(\d+)\s+T:(\d+)/);
    if (match) {
      const [_, number, name, points, fouls, technicals] = match;
      const player = { number, name: name.trim(), points, fouls, technicals };
      if (teamA.length < 5) teamA.push(player);
      else teamB.push(player);
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
