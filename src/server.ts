import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { Database } from './config/database';
import authRoutes from './routes/authRoutes';
import binanceRoutes from './routes/binanceRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import UserRoutes from './routes/userRoutes';
import PremiumRotes from './routes/premiumRoutes';
import SubscriptionRoutes  from './routes/subscriptionRoutes';
import { ErrorMiddleware } from './middleware/errorMiddleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/binance', binanceRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/subscription', SubscriptionRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/premium', PremiumRotes);



app.use(ErrorMiddleware.handle);

const database = Database.getInstance();
database.connect().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
});

export default app;