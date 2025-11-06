import type { Application } from '../pages/Applications';

/**
 * Export application to PDF
 */
export const exportToPDF = async (application: Application, userFullName?: string) => {
  try {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #2A2018;
              border-bottom: 3px solid #8B6B47;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #4A3F2F;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            .meta {
              background-color: #F5ECE2;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .meta p {
              margin: 5px 0;
            }
            .cover-letter {
              margin-top: 20px;
              padding: 20px;
              background-color: #FAF5F0;
              border-left: 4px solid #C29B73;
              white-space: pre-wrap;
            }
            .notes {
              margin-top: 20px;
              padding: 15px;
              background-color: #F7E7CE;
              border-radius: 5px;
            }
            .response {
              margin-top: 20px;
              padding: 15px;
              background-color: #E8D5C1;
              border-radius: 5px;
            }
            .status {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Søknad: ${application.jobListing.title}</h1>
          
          <div class="meta">
            <p><strong>Bedrift:</strong> ${application.jobListing.company}</p>
            <p><strong>Sted:</strong> ${application.jobListing.location}</p>
            ${userFullName ? `<p><strong>Kandidat:</strong> ${userFullName}</p>` : ''}
            <p><strong>Status:</strong> <span class="status">${application.status}</span></p>
            <p><strong>Søkt:</strong> ${new Date(application.createdAt).toLocaleDateString('no-NO')}</p>
            ${application.sentDate ? `<p><strong>Sendt:</strong> ${new Date(application.sentDate).toLocaleDateString('no-NO')}</p>` : ''}
          </div>

          ${application.coverLetter ? `
            <h2>Søknadsbrev</h2>
            <div class="cover-letter">${application.coverLetter}</div>
          ` : ''}

          ${application.notes ? `
            <h2>Notater</h2>
            <div class="notes">${application.notes}</div>
          ` : ''}

          ${application.response ? `
            <h2>Svar fra arbeidsgiver</h2>
            <div class="response">
              <p>${application.response}</p>
              ${application.responseDate ? `<p><em>Svar mottatt: ${new Date(application.responseDate).toLocaleDateString('no-NO')}</em></p>` : ''}
            </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>Eksportert fra JobCrawl - ${new Date().toLocaleDateString('no-NO')} ${new Date().toLocaleTimeString('no-NO')}</p>
          </div>
        </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Kunne ikke åpne print-vindu');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export application to Word document
 */
export const exportToWord = async (application: Application, userFullName?: string) => {
  try {
    // Create HTML content for Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Søknad: ${application.jobListing.title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>90</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #2A2018;
              border-bottom: 3px solid #8B6B47;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #4A3F2F;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            .meta {
              background-color: #F5ECE2;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .cover-letter {
              margin-top: 20px;
              padding: 20px;
              background-color: #FAF5F0;
              border-left: 4px solid #C29B73;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <h1>Søknad: ${application.jobListing.title}</h1>
          
          <div class="meta">
            <p><strong>Bedrift:</strong> ${application.jobListing.company}</p>
            <p><strong>Sted:</strong> ${application.jobListing.location}</p>
            ${userFullName ? `<p><strong>Kandidat:</strong> ${userFullName}</p>` : ''}
            <p><strong>Status:</strong> ${application.status}</p>
            <p><strong>Søkt:</strong> ${new Date(application.createdAt).toLocaleDateString('no-NO')}</p>
            ${application.sentDate ? `<p><strong>Sendt:</strong> ${new Date(application.sentDate).toLocaleDateString('no-NO')}</p>` : ''}
          </div>

          ${application.coverLetter ? `
            <h2>Søknadsbrev</h2>
            <div class="cover-letter">${application.coverLetter.replace(/\n/g, '<br>')}</div>
          ` : ''}

          ${application.notes ? `
            <h2>Notater</h2>
            <p>${application.notes.replace(/\n/g, '<br>')}</p>
          ` : ''}

          ${application.response ? `
            <h2>Svar fra arbeidsgiver</h2>
            <p>${application.response.replace(/\n/g, '<br>')}</p>
            ${application.responseDate ? `<p><em>Svar mottatt: ${new Date(application.responseDate).toLocaleDateString('no-NO')}</em></p>` : ''}
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>Eksportert fra JobCrawl - ${new Date().toLocaleDateString('no-NO')} ${new Date().toLocaleTimeString('no-NO')}</p>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Søknad_${application.jobListing.company}_${application.jobListing.title.replace(/[^a-z0-9]/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw error;
  }
};

