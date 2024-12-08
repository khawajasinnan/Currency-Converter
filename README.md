# Currency Converter

## Introduction

### System Overview
The Currency Converter is a web-based application providing real-time exchange rates and additional features like visual analytics and conversion history tracking. Built with modern web technologies, the app ensures compatibility across devices and delivers a seamless user experience.

### Objectives
- Provide real-time currency exchange rates.
- Convert amounts between multiple currencies.
- Visualize exchange rate trends with interactive charts.
- Track and manage conversion history.

---

## Product Scope

The application allows users to:
- Enter an amount in one currency and convert it to another using real-time exchange rates.
- Select from a comprehensive list of available currencies.
- View a history of conversions, including timestamps and amounts.
- Visualize currency exchange trends using interactive charts.
- Operate seamlessly across various devices with a responsive user interface.

---

## Functional Requirements

- **Real-time Data Fetching**: Retrieves the latest exchange rates from an external API.
- **Currency Conversion**: Allows users to input an amount and convert it to their desired currency.
- **Currency Selection**: Provides dropdowns for selecting "From" and "To" currencies.
- **Conversion History**: Saves and displays past conversion records, including date, time, and amounts.
- **Visualization**: Displays currency trends in a chart format using Chart.js.
- **Error Handling**: Informs users of invalid inputs or API issues via error messages.

---

## Non-functional Requirements

- **Performance**: Ensure conversions and data fetching are completed within 5 seconds under normal network conditions.
- **Usability**: Maintain a clean and intuitive user interface for ease of use.
- **Reliability**: Ensure consistent performance across modern web browsers, such as Chrome, Firefox, Safari, and Edge.
- **Scalability**: Design the system to accommodate additional features or API endpoints in the future.
- **Security**: Use secure HTTPS communication for API interactions to protect data integrity.

---

## Key Features

### Real-Time Currency Conversion
- **Dynamic Exchange Rates**: Fetch the latest exchange rates via an external API.
- **Simple Inputs**: Users can select currencies, input amounts, and view results instantly.

### Conversion History
- **Tracking**: Records all conversions with date, time, input, and output.
- **Management**: Users can view the history in a table format and clear it if needed.

### Visual Analytics
- **Interactive Charts**: Integrated with Chart.js to display real-time or historical trends in currency rates.

### Responsive Design
- Optimized for various screen sizes and devices.

---

## Interface Screenshots

### Main Interface
![Main Interface](https://github.com/user-attachments/assets/a4720964-418e-464f-af26-f08a610d7338)
)
)

### Conversion History
![Conversion History](https://github.com/user-attachments/assets/945f9080-2064-43be-b919-6dd5eb1e38b7)
)
)

### Graphical Representation
![Graphical Representation](https://github.com/user-attachments/assets/9a886282-fc78-4729-b4a8-a3082516059e)
)


---

## Technical Details

### Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Visualization**: Chart.js
- **Data Handling**: Local Storage (for history), Fetch API (for exchange rates)

### Functionalities
- **Real-time Updates**: Automatically fetches and displays current exchange rates.
- **Conversion History**: Maintains a local record of user transactions.
- **Error Handling**: Displays user-friendly error messages for invalid inputs or connectivity issues.

---

## Usage Instructions

1. **Launching the App**:
   - Open `index.html` in a browser.
2. **Converting Currencies**:
   - Enter the amount, select currencies, and click "Convert."
3. **Viewing History**:
   - Navigate to the "History" tab to view previous conversions.
4. **Clearing History**:
   - Click the "Clear History" button to reset the records.

---

## Future Enhancements

- Multi-language support for global accessibility.
- Historical exchange rate data for deeper financial analysis.
- Export functionality for saving conversion history to a file.
- Support for offline mode using cached exchange rates.

---

## Non-functional Quality Attributes

- **Performance**: Fast data retrieval and processing.
- **Scalability**: Code structure allows for the easy addition of new features or APIs.
- **Security**: Encrypted API calls ensure safe data transmission.
- **Reliability**: Tested for consistent performance across various platforms and browsers.
- **Maintainability**: Modular code design facilitates updates and debugging.

---

Let me know if you need additional sections or further refinements!
