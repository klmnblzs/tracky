const express = require('express')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const cors = require('cors')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'id', 'Authorization']
}))

dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 0,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

app.get('/', (req, res) => {
    res.send("Welcome to the API!")
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];

    if (token == null) { return res.status(401).json({ message: "Token: null" }); }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token: Invalid" });
        }
        req.user = decoded;
        next();
    });
}

function generateAccessToken(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
}

async function generateRefreshToken(userId) {
    if (!userId) {
        res.status(500).json({ error: "UserID megadása kötelező!" })
    }

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    if (!refreshToken) {
        res.status(500).json({ error: "Refresh token generálása sikertelen volt!" })
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        return refreshToken;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Refresh token adatbázisba rögzítése során probléma lépett fel!" })
    }
}

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body

    if(!username) return res.status(400).json({ message: "Felhasználónév megadása kötelező!" })
    if(!password) return res.status(400).json({ message: "Jelszó megadása kötelező!" })

    try {
        const [hashedPassword] = await pool.query("SELECT password FROM users WHERE username = ?", [username])
        const validPassword = hashedPassword[0].password.trim()
        const isPasswordValid = await bcrypt.compare(password, validPassword)
        
        if(isPasswordValid) {
            const [results] = await pool.query('CALL Login(?, ?)', [ username, validPassword ])
            if(results[0].length == 0) {
                res.status(401).json({ error: "Rossz jelszó!"})
            } else {
                const user = results[0][0]; 
                req.body.id=user.id
                const accessToken = generateAccessToken(req.body)
                const refreshToken = await generateRefreshToken(user.id)
                res.status(200).json({ token: accessToken, refreshToken: refreshToken })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/auth/check-duplicate', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length > 0) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        return res.status(200).json({ message: "Username is available" });

    } catch (error) {
        console.error("Error checking username:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if(!username) return res.status(400).json({ message: "Felhasználónév megadása kötelező!" })
    if(!password) return res.status(400).json({ message: "Jelszó megadása kötelező!" })
    
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const [results] = await pool.query('CALL Register(?, ?)', [ username, hashedPassword ])

            if(results.affectedRows > 0) {
                return res.status(201).json({ message: "Sikeres regisztráció!" })
            } else {
                console.log(results)
                return res.status(500).json({ error: "Sikertelen regisztráció" })
            }
            
        } catch(err) {
            console.log(err)
        res.status(500).json({ error: "Internal server error" })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Adj meg egy refresh tokent" });
    }

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).json({ message: "Érvénytelen refresh token" });

            const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);

            if (rows.length === 0) {
                return res.status(403).json({ message: "Érvénytelen refresh token" });
            }

            await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

            const newRefreshToken = await generateRefreshToken(user.userId);
            const newAccessToken = generateAccessToken({ id: user.userId }); 

            res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/auth/logout', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Nincs megadva refresh token" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);
  
        if (rows.length === 0) {
            return res.status(404).json({ message: "A refresh token nem található az adatbázisban" });
        }

        const [result] = await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken.replace(/"/g, "")]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Sikeres kijelentkezés" });
        } else {
            return res.status(500).json({ message: "A token törlése nem sikerült" });
        }

    } catch (err) {
        return res.status(500).json({ message: "Hiba történt a kijelentkezés során" });
    }
});

app.get('/expenses', async (req, res) => {
    try {
        const [results] = await pool.execute('CALL GetExpenses')
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/id/:userid/:id', async (req, res) => {
    const id = req.params.id
    const userid = req.params.userid

    try {
        const [results] = await pool.execute('CALL GetExpenseByid(?,?)', [ id, userid ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/month/:month', async (req, res) => {
    const month = req.params.month

    try {
        const [results] = await pool.execute('CALL GetExpensesByMonth(?)', [ month ])
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/:userid/:month', async (req, res) => {
    const month = req.params.month
    const userid = req.params.userid

    try {
        const [results] = await pool.execute('CALL GetExpensesByMonthAndId(?, ?)', [ month, userid ])
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/month/sum/:userid/:month', async (req, res) => {
    const month = req.params.month
    const userId = req.params.userid

    try {
        const [results] = await pool.execute('CALL CalculateExpenseByMonth(?, ?)', [ month, userId ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/new', authenticateToken, async (req, res) => {
    const {
        userId,
        month,
        category,
        amount,
        description,
    } = req.body

    if(!userId) return res.status(400).json({ message: "Felhasználó azonosító megadása kötelező!" })
    if(!month) return res.status(400).json({ message: "Hónap megadása kötelező!" })
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })
    if(!amount) return res.status(400).json({ message: "Összeg megadása kötelező!" })
    if(!description) return res.status(400).json({ message: "Leírás megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL AddExpense(?,?,?,?,?)', [
            month,
            category,
            amount,
            description,
            userId
        ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord rögzítve.' })
        } else {
            return res.status(500).json({ message: 'Sikertelen rögzítés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/delete', authenticateToken, async (req, res) => {
    const {
        id,
        userId
    } = req.body

    if(!id) return res.status(400).json({ message: "Rekordazonosító megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL DeleteExpense(?,?)', [ id, userId ])

        if(result.affectedRows > 0) {
            res.status(201).json({ message: "Rekord törölve." })
        } else {
            console.log(result)
            res.status(500).json({ message: "Sikertelen törlés." })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/edit', authenticateToken, async (req, res) => {
    const {
        id,
        category,
        amount,
        description,
        userId
    } = req.body

    if(!id) return res.status(400).json({ message: "Rekordazonosító megadása kötelező!" })
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })
    if(!amount) return res.status(400).json({ message: "Összeg megadása kötelező!" })
    if(!description) return res.status(400).json({ message: "Leírás megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL EditExpense(?, ?, ?, ?, ?)', [ category, amount, description, id, userId ])

        if(result.affectedRows > 0) {
            res.status(201).json({ message: "Rekord frissítve." })
        } else {
            console.log(result)
            res.status(500).json({ message: "Sikertelen frissítés." })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

// KATEGÓRIÁK

app.get('/categories/:userid', async (req, res) => {
    const userId = req.params.userid

    try {
        const [results] = await pool.execute('CALL GetCategories(?)', [userId] )
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/categories/new', authenticateToken, async (req, res) => {
    const {
        category,
        userId
    } = req.body
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL AddCategory(?,?)', [ category, userId ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord rögzítve.' })
        } else {
            console.log(result)
            return res.status(500).json({ message: 'Sikertelen rögzítés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/categories/delete', authenticateToken, async (req, res) => {
    const {
        category,
        userId
    } = req.body
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL DeleteCategoryByName(?,?)', [ category, userId ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord törölve.' })
        } else {
            console.log(result)
            return res.status(500).json({ message: 'Sikertelen torlés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

// FIZETÉS

app.post('/salary/new', authenticateToken, async (req, res) => {
    const {
        amount,
        month,
        userId
    } = req.body
    if(!amount) return res.status(400).json({ message: "Fizetés megadása kötelező!" })
    if(!month) return res.status(400).json({ message: "Hónap megadása kötelező!" })
    if(!userId) return res.status(400).json({ message: "id megadása kötelező!" })
    
    try {
        
        const [results] = await pool.execute('CALL AddSalary(?, ?, ?)', [amount, month, userId])

        if(results.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord rögzítve.' })
        } else {
            console.log(results)
            return res.status(500).json({ message: 'Sikertelen rögzítés.' })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/salary/edit', authenticateToken, async (req, res) => {
    const {
        amount,
        month,
        userId
    } = req.body
    if(!amount) return res.status(400).json({ message: "Fizetés megadása kötelező!" })
    if(!month) return res.status(400).json({ message: "Hónap megadása kötelező!" })
    if(!userId) return res.status(400).json({ message: "id megadása kötelező!" })
    
    try {
        
        const [results] = await pool.execute('CALL EditSalary(?,?,?)', [amount, month, userId])

        if(results.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord frissítve.' })
        } else {
            console.log(results)
            return res.status(500).json({ message: 'Sikertelen frissítés.' })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/salary/get/:userid/:month', async (req, res) => {
    const month = req.params.month
    const userid = req.params.userid

    try {
        const [results] = await pool.execute('CALL GetSalaryByMonth(?, ?)', [ month, userid ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.listen(3000, (req, res) => {
    console.log("Listening on port: 3000")
})