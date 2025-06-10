# Documentation Backend YAYA SPICY JUICE - API REST

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies utilisées](#technologies-utilisées)
4. [Structure du projet](#structure-du-projet)
5. [Installation et configuration](#installation-et-configuration)
6. [Modèles de données](#modèles-de-données)
7. [Authentification et sécurité](#authentification-et-sécurité)
8. [Routes API](#routes-api)
9. [Middleware](#middleware)
10. [Gestion des paiements](#gestion-des-paiements)
11. [Gestion des emails](#gestion-des-emails)
12. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Le backend de YAYA SPICY JUICE est une API REST construite avec Node.js et Express, utilisant MongoDB comme base de données. L'API gère :

- **Authentification JWT** avec refresh tokens
- **Gestion des utilisateurs** et de leurs profils
- **Catalogue produits** avec catégories et ingrédients
- **Système de commandes** complet
- **Intégration Stripe** pour les paiements
- **Envoi d'emails** via Nodemailer
- **CORS** configuré pour l'application frontend

## 🏗️ Architecture

### Stack technique
- **Runtime** : Node.js
- **Framework** : Express.js 4.19.2
- **Base de données** : MongoDB avec Mongoose 8.5.2
- **Authentification** : JWT (jsonwebtoken 9.0.2)
- **Paiements** : Stripe 16.8.0
- **Emails** : Nodemailer 6.9.14
- **Sécurité** : bcryptjs 2.4.3, CORS 2.8.5

### Pattern architectural
- **MVC** : Modèles, Routes (Controllers), Middleware
- **API RESTful** : Endpoints suivant les conventions REST
- **Middleware-based** : Authentification et validation par middleware

## 🛠️ Technologies utilisées

### Core
```json
{
  "express": "^4.19.2",
  "mongoose": "^8.5.2",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

### Services externes
```json
{
  "stripe": "^16.8.0",
  "nodemailer": "^6.9.14",
  "cors": "^2.8.5"
}
```

### Utilitaires
```json
{
  "dotenv": "^16.4.5",
  "morgan": "~1.9.1",
  "cookie-parser": "~1.4.4",
  "debug": "~2.6.9"
}
```

## 📁 Structure du projet

```
backend/
├── app.js                 # Application Express principale
├── bin/
│   └── www               # Point d'entrée du serveur
├── models/               # Modèles Mongoose
│   ├── connection.js     # Configuration MongoDB
│   ├── users.js         # Modèle utilisateur
│   ├── products.js      # Modèle produit
│   ├── ingredients.js   # Modèle ingrédient
│   ├── orders.js        # Modèle commande
│   └── packs.js         # Modèle pack
├── routes/              # Routes API
│   ├── index.js         # Routes principales
│   ├── users.js         # Gestion utilisateurs
│   ├── products.js      # Gestion produits
│   ├── ingredients.js   # Gestion ingrédients
│   └── sendmail.js      # Envoi d'emails
├── middleware/          # Middleware personnalisés
│   └── authMiddleware.js # Authentification JWT
├── modules/             # Utilitaires
│   └── checkBody.js     # Validation des données
├── public/              # Assets statiques
└── vercel.json          # Configuration déploiement
```

## 🚀 Installation et configuration

### Prérequis
- Node.js 16+
- MongoDB 4.4+
- Compte Stripe (pour les paiements)
- Compte Gmail (pour les emails)

### Installation
```bash
# Cloner le repository
git clone [repository-url]

# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install
```

### Variables d'environnement
Créer un fichier `.env` :
```env
# Base de données
CONNECTION_STRING=mongodb://localhost:27017/yaya-spicyjuice

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_SECRET_REFRESH_KEY=your-refresh-secret-key
JWT_EXPIRATION_TIME=15m

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Port
PORT=3000
```

### Démarrage
```bash
# Développement
npm run dev

# Production
npm start
```

## 🗃️ Modèles de données

### User (`models/users.js`)
```javascript
const userSchema = mongoose.Schema({
  lastName: String,
  firstName: String,
  age: Number,
  gender: String,
  email: String,
  phone: String,
  password: String,
  accessToken: String,
  refreshToken: String,
  address: [addressSchema],
  subscription: [subscriptionSchema],
  deposit: [depositSchema],
  status: {
    type: String,
    enum: ['admin', 'client']
  }
});
```

#### Sous-schémas
```javascript
// Adresse
const addressSchema = mongoose.Schema({
  streetNumber: String,
  streetName: String,
  city: String,
  zipCode: Number,
  billing: Boolean,
  instruction: String
});

// Abonnement
const subscriptionSchema = mongoose.Schema({
  subscribed: Boolean,
  subscriptionType: {
    type: String,
    enum: ['Lonely Wolf', 'Duo', 'Family']
  },
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['En cours', 'En pause', 'Désabonné']
  }
});
```

### Product (`models/products.js`)
```javascript
const productSchema = mongoose.Schema({
  productId: String,
  name: String,
  category: {
    type: String,
    enum: ['Super Jus', 'Infusions', 'Super Shots', 'MYJUICE']
  },
  volumes: [Object],
  bottle: {
    type: String,
    enum: ['Verre', 'PET']
  },
  description: String,
  price: Number,
  composition: [compositionSchema],
  images: [imageSchema],
  nutritionalInfo: [nutritionInfoSchema]
});
```

#### Middleware de sauvegarde
```javascript
// Définition automatique des volumes selon la catégorie
productSchema.pre('save', function(next) {
  if (this.category === 'Super Shots') {
    this.volumes = [{capacity: '60ml', priceMultiplier: 1}];
  } else {
    this.volumes = [
      {capacity: '250ml', priceMultiplier: 1}, 
      {capacity: '1l', priceMultiplier: 3}
    ];
  }
  next();
});
```

### Order (`models/orders.js`)
```javascript
const orderSchema = mongoose.Schema({
  orderId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: [
      'Pending payment', 'Paid', 'Processing', 
      'Completed', 'Shipped', 'Delivered', 
      'Canceled', 'Refunded'
    ]
  },
  items: [itemSchema],
  orderDate: Date,
  deliveryDate: Date,
  deliveryTime: String,
  total: Number,
  deliveryAddress: Object,
  credit: Number
});
```

### Ingredient (`models/ingredients.js`)
```javascript
const ingredientSchema = mongoose.Schema({
  name: String,
  type: String,
  dosage: Number,
  color: String,
  price: Number,
  benefits: [String]
});
```

## 🔐 Authentification et sécurité

### JWT Implementation
Système à double token (access + refresh) :

```javascript
// Génération des tokens
function generateAccessToken(userData) {
  return jwt.sign(
    userData, 
    process.env.JWT_SECRET_KEY, 
    { expiresIn: process.env.JWT_EXPIRATION_TIME }
  );
}

function generateRefreshToken(userData) {
  return jwt.sign(
    userData, 
    process.env.JWT_SECRET_REFRESH_KEY, 
    { expiresIn: '1y' }
  );
}
```

### Middleware d'authentification (`middleware/authMiddleware.js`)
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

### Gestion des mots de passe
```javascript
// Hachage avec bcrypt
const hash = bcrypt.hashSync(password, 10);

// Vérification
const isValid = await bcrypt.compare(password, foundUser.password);
```

### Refresh Token
Système de renouvellement automatique :
```javascript
router.post('/refreshToken', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_KEY, async (err, user) => {
    if (err) return res.status(401).json({ error: 'Access denied' });
    
    // Vérification de la validité en base
    const foundUser = await User.findOne({ email: user.email });
    
    // Génération nouveau token
    const refreshedAccessToken = generateAccessToken(userData);
    res.send({ accessToken: refreshedAccessToken });
  });
});
```

## 🛣️ Routes API

### Routes principales (`routes/index.js`)

#### POST `/order-confirm`
Confirmation d'une commande
```javascript
router.post('/order-confirm', authenticateToken, async (req, res) => {
  // Validation des données
  if (!checkBody(req.body.data, ['items', 'deliveryDate', 'deliveryTime', 'deliveryAddress', 'total'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  // Génération ID commande
  const orderId = generateOrderId();
  
  // Sauvegarde en base
  const newOrder = new Order(orderData);
  const savedOrder = await newOrder.save();
  
  res.json({ result: true, data: savedOrder });
});
```

#### POST `/create-checkout-session`
Création session Stripe
```javascript
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    customer_email,
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/merci?success=true&orderId=${orderId}`,
    cancel_url: `${process.env.FRONTEND_URL}/commander?canceled=true`
  });

  res.json({ result: true, data: session });
});
```

### Routes utilisateurs (`routes/users.js`)

#### POST `/users/signup`
Inscription utilisateur
```javascript
router.post('/signup', function(req, res, next) {
  // Validation
  if (!checkBody(req.body, ['email', 'password', 'firstName', 'lastName'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  // Vérification unicité email
  User.findOne({ email }).then(data => {
    if (data === null) {
      // Création utilisateur
      const hash = bcrypt.hashSync(password, 10);
      const accessToken = generateAccessToken(userData);
      const refreshToken = generateRefreshToken({ email });
      
      const newUser = new User({
        ...userData,
        password: hash,
        accessToken,
        refreshToken
      });
      
      newUser.save().then(newDoc => {
        res.json({ result: true, data: userData });
      });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  });
});
```

#### POST `/users/login`
Connexion utilisateur
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const foundUser = await User.findOne({ email });
  
  if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
    return res.status(401).send('Error: Unauthorized');
  }
  
  // Génération nouveaux tokens
  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken({ email });
  
  // Mise à jour en base
  foundUser.accessToken = accessToken;
  foundUser.refreshToken = refreshToken;
  await foundUser.save();
  
  res.json({ result: true, data: userData });
});
```

#### GET `/users/orders`
Historique des commandes utilisateur
```javascript
router.get('/orders', authenticateToken, (req, res) => {
  const orders = Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $match: { "user.email": req.user.email }
    },
    { $sort: { orderDate: -1 } }
  ])
  .then(data => {
    res.json({ result: true, orders: data });
  });
});
```

### Routes produits (`routes/products.js`)

#### GET `/products`
Liste tous les produits
```javascript
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve products", 
      error: error.message 
    });
  }
});
```

#### GET `/products/categories`
Liste des catégories
```javascript
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch categories", 
      error: error.message 
    });
  }
});
```

#### GET `/products/product-info/:slug`
Détail d'un produit avec population des ingrédients
```javascript
router.get('/product-info/:slug', function(req, res) {
  Product.findOne({ productId: req.params.slug })
    .populate('composition')
    .populate({
      path: 'composition',
      populate: {
        path: 'ingredient',
        model: 'ingredients'
      }
    })
    .then(data => {
      if (data === null) {
        res.json({ result: false, error: 'Product not found' });
      } else {
        res.json({ result: true, product: data });
      }
    });
});
```

### Routes ingrédients (`routes/ingredients.js`)

#### GET `/ingredients`
Liste tous les ingrédients
```javascript
router.get('/', function(req, res) {
  Ingredient.find().then(data => {
    if (data === null) {
      res.json({ result: false, error: 'No Ingredient found' });
    } else {
      res.json({ result: true, ingredients: data });
    }
  });
});
```

### Routes emails (`routes/sendmail.js`)

#### POST `/sendmail`
Envoi d'emails de contact
```javascript
router.post('/', async (req, res) => {
  const { name, firstName, email, message } = req.body;
  
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USERNAME,
    subject: 'New Contact Message',
    text: `You have a new message from ${name} ${firstName} (${email}): ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ 
      success: true, 
      message: "Email sent successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to send email", 
      error: error.message 
    });
  }
});
```

## 🔧 Middleware

### Validation des données (`modules/checkBody.js`)
```javascript
function checkBody(body, keys) {
  let isValid = true;
  
  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
    }
  }
  
  return isValid;
}
```

### Configuration CORS (`app.js`)
```javascript
const cors = require('cors');
app.use(cors()); // Permet toutes les origines en développement
```

### Logging
```javascript
const morgan = require('morgan');
app.use(morgan('dev')); // Logging des requêtes HTTP
```

## 💳 Gestion des paiements

### Configuration Stripe
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### Création session de paiement
```javascript
const session = await stripe.checkout.sessions.create({
  customer_email: orderData.customer_email,
  line_items: orderData.items.map(item => ({
    price_data: {
      currency: 'eur',
      unit_amount: (item.product.price * item.product.options.volume.priceMultiplier) * 100,
      product_data: {
        name: item.product.name,
        images: []
      }
    },
    quantity: item.quantity
  })),
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/merci?success=true&orderId=${orderId}`,
  cancel_url: `${process.env.FRONTEND_URL}/commander?canceled=true`
});
```

### Gestion des webhooks
Mise à jour du statut de commande après paiement :
```javascript
router.post('/order-success', authenticateToken, async (req, res) => {
  const { orderId } = req.body;
  
  Order.findOneAndUpdate(
    { orderId }, 
    { status: 'Paid' }
  ).then(data => {
    if (data) {
      // Envoi email de confirmation
      res.json({ result: true, data });
    } else {
      res.json({ result: false, error: 'Order not found' });
    }
  });
});
```

## 📧 Gestion des emails

### Configuration Nodemailer
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Types d'emails
1. **Contact** : Formulaires de contact
2. **Confirmation** : Confirmation de commande (à implémenter)
3. **Notifications** : Statut de livraison (à implémenter)

## 🚀 Déploiement

### Configuration Vercel (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
  ]
}
```

### Variables d'environnement production
```env
CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/yaya-prod
JWT_SECRET_KEY=production-secret-key
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://yaya-spicyjuice.com
```

### Scripts NPM
```json
{
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  }
}
```

## 📊 Monitoring et logs

### Logging des erreurs
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### Monitoring recommandé
- **Sentry** : Tracking des erreurs
- **New Relic** : Performance monitoring
- **MongoDB Compass** : Monitoring base de données

## 🔒 Sécurité

### Bonnes pratiques implémentées
- ✅ **Hachage des mots de passe** avec bcrypt
- ✅ **JWT avec refresh tokens**
- ✅ **Validation des entrées** avec checkBody
- ✅ **CORS configuré**
- ✅ **Variables d'environnement** pour les secrets

### Améliorations possibles
- **Rate limiting** : Limitation des requêtes
- **Helmet** : Headers de sécurité
- **Validation schema** : Joi ou Yup
- **HTTPS** : Certificats SSL
- **Input sanitization** : Protection XSS

## 🧪 Tests

### Tests recommandés
```javascript
// Tests unitaires avec Jest
describe('User Authentication', () => {
  test('should create user with hashed password', async () => {
    // Test de création utilisateur
  });
  
  test('should authenticate user with valid credentials', async () => {
    // Test d'authentification
  });
});
```

### Tests d'intégration
- Tests des endpoints API
- Tests de connexion base de données
- Tests d'intégration Stripe

---

## 📝 Notes de développement

### Améliorations futures
1. **Cache Redis** : Cache des requêtes fréquentes
2. **WebSockets** : Notifications temps réel
3. **Queue system** : Traitement asynchrone des commandes
4. **Microservices** : Séparation des services
5. **GraphQL** : API plus flexible
6. **Docker** : Containerisation
7. **CI/CD** : Pipeline automatisé

### Maintenance
- **Backup** : Sauvegarde automatique MongoDB
- **Updates** : Mise à jour régulière des dépendances
- **Monitoring** : Surveillance des performances
- **Documentation** : Mise à jour de la doc API

Cette documentation couvre tous les aspects du backend YAYA SPICY JUICE. L'API est robuste et prête pour la production avec quelques améliorations de sécurité supplémentaires.
