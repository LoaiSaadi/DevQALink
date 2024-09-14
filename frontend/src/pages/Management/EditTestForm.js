import React, { useState, useEffect, useRef } from 'react';
import './EditTestForm.css';

const EditTestForm = ({ test = {}, closeForm, saveTest }) => {
    console.log('EditTestForm test:', test);
    const [formData, setFormData] = useState({
        testTitle: test.testTitle || '',
        testDescription: test.testDescription || '',
        theCode: test.theCode ? test.theCode.join('\n') : '',
        saveAs: test.saveAs || 'Python (.py)', // Default to Python
    });

    const formRef = useRef(null);

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: Ensure required fields are not empty
        if (!formData.testTitle || !formData.testDescription || !formData.saveAs) {
            alert('Please fill out all required fields.');
            return; // Exit the function without submitting the form
        }

        const testData = {
            ...formData,
            theCode: formData.theCode.split('\n').map(code => code.trim()).filter(code => code) // Convert codes into array
        };

        try {
            const response = await fetch(`http://localhost:3000/tests/updateTestById/${test.testId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Test updated successfully!');
                console.log('Test ID:', result.test.testId);

                if (saveTest) {
                    saveTest(result.test);
                }

                closeForm();
            } else {
                console.error('Failed to update test:', response.statusText);
            }
        } catch (error) {
            console.error('Error occurred while updating test:', error);
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
                    <h2>Edit Test</h2>

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
                            placeholder="Enter each code snippet on a new line"
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
                            <option value="Python (.py)">Python (.py)</option>
                            <option value="JavaScript (.js)">JavaScript (.js)</option>
                            <option value="Java (.java)">Java (.java)</option>
                            <option value="C++ (.cpp)">C++ (.cpp)</option>
                            <option value="Ruby (.rb)">Ruby (.rb)</option>
                        </select>
                    </div>

                    <div className="btn-container">
                        <button type="submit" className="submit-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTestForm;
