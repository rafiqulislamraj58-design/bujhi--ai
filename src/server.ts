import app from './app/app.js'
const PORT = process.env.PORT || 5000;

app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});