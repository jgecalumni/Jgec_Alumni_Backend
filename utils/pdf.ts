import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { toWords } from "number-to-words";

export const generateReceiptPDF = async (receipt: any): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const buffers: Buffer[] = [];

		doc.on("data", (chunk) => buffers.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(buffers)));
		doc.on("error", (err) => reject(err));

		// Header
		doc.image("public/Logo.png", 40, 40, { width: 500 });
		doc.moveDown(10);

		doc
			.font("Helvetica-Bold")
			.fontSize(14)
			.text("Money Receipt", { align: "center" });
		doc.underline(248, 200, 100, 3);

		// Serial No and Date
		doc.font("Helvetica").fontSize(10.3).text(`Sl. No: ${receipt.id}`, 50, 250);
		doc.text(`Date: ${format(receipt.createdAt, "dd/MM/yyyy")}`, 430, 250);

		doc.moveDown(4);

		// Registration Number

		// Received from
		doc.text(`Received with thanks from ${receipt.gender==="Male"?"Sri":"Smt"}: ${receipt.name}`, 50, doc.y);
		// let receivedFromY = doc.y;
		// doc.underline(220, receivedFromY, 200, 1);

		doc.moveDown(2);

		doc.text(`PAN: ${receipt.panId}`, 50, doc.y);
		// let receivedFromY = doc.y;
		// doc.underline(220, receivedFromY, 200, 1);

		doc.moveDown(2);

		// Sum of rupees
		doc.text(
			`Donation Amount: Rs.${receipt.amount}/- (${
				toWords(receipt.amount).charAt(0).toUpperCase() +
				toWords(receipt.amount).slice(1) +
				" rupees only."
			}) (Credited on: ${format(receipt.date, "dd/MM/yyyy")})`,
			50,
			doc.y
		);
		// let sumOfRupeesY = doc.y;
		// doc.text("_____________________________", 200, sumOfRupeesY);
		// doc.underline(200, sumOfRupeesY + 2, 150, 1);

		doc.moveDown(2);

		// Donation for
		doc.text(`Donation for: ${receipt.donationFor}`, 50, doc.y);
		// let donationForY = doc.y;
		// doc.text("_____________________________", 200, donationForY);
		// doc.underline(200, donationForY + 2, 350, 1);

		// let amountY = doc.y;
		// doc.text("_______________", { align: "right", x: 550 });
		// doc.underline(550, amountY + 2, 25, 1);

		doc.moveDown(5);
		doc
			.font("Helvetica")
			.text(
				`Note: This is a digitally generated receipt and does not require a physical signature.`
			);

		// Footer
		doc.moveDown(4);
		doc
			.font("Helvetica-Bold")
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
