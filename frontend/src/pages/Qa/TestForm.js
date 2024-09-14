import React, { useState, useEffect, useRef } from 'react';
import './TestForm.css';
// import '../Jobs/JobForm.css'

const languageOptions = [
    { value: 'python', label: 'Python (.py)' },
    { value: 'javascript', label: 'JavaScript (.js)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'csharp', label: 'C# (.cs)' },
    { value: 'ruby', label: 'Ruby (.rb)' }
];

const TestForm = ({ closeForm, onTestAdded }) => {
    const [formData, setFormData] = useState({
        testTitle: '',
        testDescription: '',
        theCode: '',
        saveAs: ''
    });

    const formRef = useRef(null);

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure required fields are not empty
        if (!formData.testTitle || !formData.testDescription || !formData.saveAs) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }
        
        console.log('Form data:', formData);
        const testData = {
            ...formData,
            theCode: formData.theCode.split('\n').map(code => code.trim()).filter(code => code) // Convert codes into array
        };

        try {
            const response = await fetch('http://localhost:3000/tests/addTest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Test added successfully:', result.test);
                console.log('Test ID:', result.test.testId);
                
                if (onTestAdded) {
                    onTestAdded(result.test);
                }

                closeForm();
            } else {
                console.error('Failed to add test:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while adding test:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (formRef.current && !formRef.current.contains(e.target)) {
                closeForm();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeForm]);

    return (
        <div className="form-overlay">
            <div className="form-card" ref={formRef}>
                <button className="close-btn" onClick={closeForm}>&times;</button>
                <form className="form-container" onSubmit={handleSubmit}>
                    <h2>Add New Test</h2>

                    <div className="form-row">
                        <label htmlFor="testTitle">Test Title</label>
                        <input
                            type="text"
                            id="testTitle"
                            name="testTitle"
                            value={formData.testTitle}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="testDescription">Test Description</label>
                        <input
                            type="text"
                            id="testDescription"
                            name="testDescription"
                            value={formData.testDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="theCode">The Code</label>
                        <textarea
                            id="theCode"
                            name="theCode"
                            value={formData.theCode}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Paste your code here..."
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="saveAs">Save As</label>
                        <select
                            id="saveAs"
                            name="saveAs"
                            value={formData.saveAs}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a language...</option>
                            {languageOptions.map(option => (
                                <option key={option.value} value={option.label}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="btn-container">
                        <button type="submit" className="submit-btn">Add Test</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestForm;
