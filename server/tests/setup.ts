process.env.NODE_ENV = 'test';
process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/rigatti-test';
process.env.JWT_SECRET ??= 'test-secret-com-mais-de-trinta-e-dois-caracteres';
process.env.ANTHROPIC_API_KEY ??= 'sk-ant-test';
