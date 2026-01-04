(function () {
  const factorMap = window.COMMUTATION_FACTORS || {};

  // Helper functions
  function q(id) { return document.getElementById(id); }
  function money(x) { return Number.isFinite(x) ? x.toFixed(2) : "0.00"; }

  // ===========================
  // Populate Commutation Factor Table
  // ===========================
  (function populateFactors() {
    const tbody = q("factorTable").querySelector("tbody");
    Object.keys(factorMap)
      .sort((a, b) => a - b)
      .forEach((k) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${k}</td><td>${factorMap[k].toFixed(3)}</td>`;
        tbody.appendChild(tr);
      });
  })();

  // ===========================
  // Calculate Pension Button
  // ===========================
  q("calculateBtn").addEventListener("click", () => {
    // Show popup ad (placeholder)
    //q("popupAd").style.display = "flex";

    // ---------------------------
    // Input values
    // ---------------------------
    const dob = q("dob").value ? new Date(q("dob").value) : null;
    const doe = q("doe").value ? new Date(q("doe").value) : null;
    const serviceYears = parseFloat(q("serviceYears").value) || 0;

    const basicPay = parseFloat(q("basicPay").value || 0);
    const msPay = parseFloat(q("msPay").value || 0);
    const classPay = parseFloat(q("classPay").value || 0);
    const xgp = parseFloat(q("xgp").value || 0);
    const daPerc = parseFloat(q("daPerc").value || 0);
    const computation = q("computation").checked;
    const leaveDays = parseFloat(q("leaveDays").value || 0);
    const lastApff = parseFloat(q("lastApff").value || 0);
    const commuteRate = parseFloat(q("commuteRate").value || 50);

    // ---------------------------
    // Pension Calculations
    // ---------------------------
    const basicPension = (basicPay + msPay + classPay + xgp) / 2;
    const daAmount = (basicPension * daPerc) / 100;
    const basicWithDA = basicPension + daAmount;

    // Age calculations
    let ageAtEnrollment = 0;
    if (dob && doe) {
      ageAtEnrollment = Math.floor((doe - dob) / (365.25 * 24 * 3600 * 1000));
    }
    const ageNext = Math.round(ageAtEnrollment + Number(serviceYears));

    // Factor lookup (nearest match if missing)
    let purchaseValue = factorMap[ageNext];
    if (!purchaseValue) {
      const ages = Object.keys(factorMap).map((x) => parseInt(x)).sort((a, b) => a - b);
      const nearest = ages.reduce((a, c) =>
        Math.abs(c - ageNext) < Math.abs(a - ageNext) ? c : a
      );
      purchaseValue = factorMap[nearest];
    }

    // ---------------------------
    // Commutation & Lump-sum
    // ---------------------------
    let commutationAmount = 0;
    let serviceAfterCom = basicPension + daAmount;
    if (computation) {
      const commutedPortion = basicPension * (commuteRate / 100);
      commutationAmount = commutedPortion * 12 * purchaseValue;
      serviceAfterCom = (basicPension - commutedPortion) + daAmount;
    }

    const reckonEmoluments = basicPay + msPay + xgp + classPay;
    const gratuity =
      0.5 *
      (reckonEmoluments + (reckonEmoluments * daPerc) / 100) *
      (Number(serviceYears) + 5);
    const leaveEncash = ((basicPay + (basicPay * daPerc) / 100) / 30) * leaveDays;
    const transferGrant = ((basicPay + msPay) * 80) / 100;
    const agi = 1200000;
    const echs = 30000;

    // ---------------------------
    // Build Result Table
    // ---------------------------
    const tbody = q("resultTable").querySelector("tbody");
    tbody.innerHTML = "";

    const rows = [
      ["Basic Pension (before DA)", money(basicPension)],
      ["DA on Basic Pension", money(daAmount)],
      ["Basic Pension after DA", money(basicWithDA)],
      ["Commutation Lump-sum", money(commutationAmount)],
      ["Service Pension after Commutation (monthly)", money(serviceAfterCom)],
      ["Retirement Gratuity (estimate)", money(gratuity)],
      ["Leave Encashment", money(leaveEncash)],
      ["Transfer Grant", money(transferGrant)],
      ["Last APFF Fund", money(lastApff)],
      ["AGI (fixed)", money(agi)],
    ];

    // Add each row to the table
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>`;
      tbody.appendChild(tr);
    });

    // ---------------------------
    // ✅ Grand Total Calculation
    // ---------------------------
    let grandTotal = 0;
    rows.forEach((r) => {
      const val = parseFloat(r[1].replace(/,/g, "")) || 0;
      grandTotal += val;
    });

    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `<th>Grand Total</th><th>₹${grandTotal.toLocaleString()}</th>`;
    tbody.appendChild(totalRow);

    // ---------------------------
    // UI Updates
    // ---------------------------
    q("resultBlock").style.display = "block";
    q("redArrow").style.display = "inline";
    q("ageNextHighlighted").textContent = ageNext;

    // Highlight matching factor row
    document.querySelectorAll("#factorTable tbody tr").forEach((tr) => {
      tr.style.fontWeight =
        tr.children[0].textContent === String(ageNext) ? "700" : "400";
    });
  });

  // ===========================
  // Popup & Reset
  // ===========================
  //q("closePopup").addEventListener("click", () => {
   /// q("popupAd").style.display = "none";
  //});

  q("resetBtn").addEventListener("click", () => {
    q("pensionForm").reset();
    q("resultBlock").style.display = "none";
  });

  // ===========================
  // Jobs Link
  // ===========================
 /*q("openJobs") &&
    q("openJobs").addEventListener("click", () => {
      const state = q("stateSelect").value;
      if (!state) {
        alert("Please select a state");
        return;
      }
      const url =
        "https://www.freejobalert.com/state-government-jobs/?s=" +
        encodeURIComponent(state);
      window.open(url, "_blank");
    });*/
})();
