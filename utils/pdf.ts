import PDFDocument from "pdfkit";

export const generateReceiptPDF = async (receipt: any): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const buffers: Buffer[] = [];

		doc.on("data", (chunk) => buffers.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(buffers)));
		doc.on("error", (err) => reject(err));

		// Header
		doc
			.font("Helvetica-Bold")
			.fontSize(14)
			.text("THE JALPAIGURI GOVERNMENT ENGINEERING COLLEGE", {
				align: "center",
			});
		doc
			.font("Helvetica")
			.fontSize(12)
			.text("ALUMNI ASSOCIATION", { align: "center" });

		doc.moveDown(4);

		// Serial No and Date
		doc.fontSize(10.3).text(`Sl. No: ${receipt.id}`, 50, 150);
		doc.text(`Date: ${new Date().toLocaleDateString()}`, 430, 150);

		doc.moveDown(3.5);

		// Registration Number
		doc.text(
			"Unique Registration Number: AADAT3213C/10/15-16/S-0090",
			50,
			doc.y
		);

		// Receipt Body
		doc.moveDown(3);

		// Received from
		doc.text(`Received with thanks from Sri / Smt: ${receipt.name}`, 50, doc.y);
		// let receivedFromY = doc.y;
		// doc.underline(220, receivedFromY, 200, 1);

		doc.moveDown(2);

		// Sum of rupees
		doc.text(`Donation Amount: Rs. ${receipt.amount}`, 50, doc.y);
		// let sumOfRupeesY = doc.y;
		// doc.text("_____________________________", 200, sumOfRupeesY);
		// doc.underline(200, sumOfRupeesY + 2, 150, 1);

		doc.moveDown(2);

		// Donation for
		doc.text(`Donation for: ${receipt.donationFor}`, 50, doc.y);
		// let donationForY = doc.y;
		// doc.text("_____________________________", 200, donationForY);
		// doc.underline(200, donationForY + 2, 350, 1);

		doc.moveDown(3);

		// Amount
		doc.fontSize(10.3).text(`Rs. ${receipt.amount}`, { align: "right" });
		// let amountY = doc.y;
		// doc.text("_______________", { align: "right", x: 550 });
		// doc.underline(550, amountY + 2, 25, 1);

		doc.moveDown(2);

		// Footer
		doc.moveDown(3);
		doc
			.fontSize(10.3)
			.text(
				"Donations are exempted from Income Tax under section 80G(5) VI of the Income Tax Act, 1961 vide " +
					"Memo Number CIT (E)/10E/15/15-16/G-0162/2449-51 dated 9/10/2015 with effect from 17.04.2015 " +
					"PAN - AADAT3213C. Under schedule 1, Article 53, Exemption (b) of the Indian Stamp Act, charitable " +
					"institutions are not required to issue stamped receipts for donations.",
				50,
				doc.y,
				{ align: "justify", width: 500 }
			);

		doc.end();
	});
};
