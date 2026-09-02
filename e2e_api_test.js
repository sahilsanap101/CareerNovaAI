const http = require('http');

const API_BASE = 'http://localhost:5000/api/v1';

async function fetchJSON(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        let body = await res.text();
        try { body = JSON.parse(body); } catch (e) { }
        throw { status: res.status, body };
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function runTests() {
    console.log('--- STARTING E2E PROFILE TESTS ---');
    let cookie = '';

    try {
        // 1. Auth Login
        console.log('Logging in as student...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student@pathforge.dev', password: 'Student@1234' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const cookies = loginRes.headers.get('set-cookie');
        if (cookies) {
            cookie = cookies.split(';')[0]; // simple cookie parse
        }
        console.log('Login successful. Cookie:', !!cookie);

        const authHeaders = { 'Cookie': cookie };

        // 2. Personal/Academic Profile Update (Valid)
        console.log('Testing Profile Update (Valid Data)...');
        const validProfile = {
            fullName: 'Arjun Updated',
            college: 'IIT Kanpur',
            university: 'IIT',
            degree: 'B.Tech',
            branch: 'Electrical',
            specialization: 'Power Systems',
            currentYear: 4,
            currentSemester: 8,
            graduationYear: 2024,
            cgpa: 9.1,
            bio: 'New bio',
            city: 'Delhi',
            country: 'India'
        };
        await fetchJSON('/users/profile', { method: 'PUT', headers: authHeaders, body: JSON.stringify(validProfile) });
        console.log('✅ Profile Update (Valid) OK');

        // 3. Profile Update (Empty Optional Strings)
        console.log('Testing Profile Update (Empty Optionals)...');
        const emptyOptionalProfile = {
            fullName: 'Arjun Updated',
            college: '',
            university: '',
            degree: null, // should be fine
            branch: '',
            cgpa: null,
            city: '' // should be parsed correctly now
        };
        await fetchJSON('/users/profile', { method: 'PUT', headers: authHeaders, body: JSON.stringify(emptyOptionalProfile) });
        console.log('✅ Profile Update (Empty Optionals) OK');

        // 4. Invalid Profile Data (Validation Error)
        console.log('Testing Profile Update (Validation Errors)...');
        try {
            await fetchJSON('/users/profile', { method: 'PUT', headers: authHeaders, body: JSON.stringify({ fullName: '' }) });
            console.log('❌ Validation should have failed for empty full name!');
            process.exit(1);
        } catch (err) {
            if (err.status === 400 || err.status === 422) {
                console.log('✅ Validation correctly caught invalid fullName');
            } else {
                throw err;
            }
        }

        // 5. Academic/Personal Verification
        const profileData = await fetchJSON('/profile', { headers: authHeaders });
        if (profileData.data.profile.fullName !== 'Arjun Updated') {
            throw new Error('Data persistence failed on GET.');
        }
        console.log('✅ Data persistence verified on GET /profile');

        // 6. Career Goals Update
        console.log('Testing Career Goals Update...');
        await fetchJSON('/profile/career/update', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ preferredJobRole: 'ML Engineer', preferredIndustry: 'AI', expectedSalary: '' })
        });
        console.log('✅ Career Goals Update OK');

        // 7. Verify all sections
        const completeProfileData = await fetchJSON('/profile', { headers: authHeaders });
        if (completeProfileData.data.careerGoal.preferredJobRole !== 'ML Engineer') {
            throw new Error('Career persistence failed on GET.');
        }
        console.log('✅ Career data persistence verified on GET /profile');

        console.log('--- ALL E2E API TESTS PASSED! ---');
    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
}

runTests();
