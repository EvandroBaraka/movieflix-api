import express from 'express';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocument = require('../swagger.json');

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/movies', async (_, res) => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: 'asc',
            },
            include: {
                genres: true,
                languages: true,
            },
        });
        res.json(movies);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } =
        req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({
                message: 'Já existe um filme cadastrado com esse título.',
            });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: `Falha ao cadastrar um filme - ${error}` });
    }

    res.status(201).send('Filme adicionado com sucesso.');
});

app.get('/movies/:id', async (req, res) => {
    try {
        const movie = await prisma.movie.findMany({
            where: {
                id: Number(req.params.id),
            },
            include: {
                genres: true,
                languages: true,
            },
        });
        res.json(movie);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.put('/movies/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: 'Filme não encontrado.' });
        }

        const data = { ...req.body };

        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;

        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: 'Falha ao atualizar o registro do filme' });
    }
    res.status(200).send('Filme atualizado com sucesso.');
});

app.delete('/movies/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const movie = await prisma.movie.findUnique({ where: { id } });
        if (!movie) {
            return res.status(404).send({ message: 'Filme não encontrado' });
        }

        await prisma.movie.delete({ where: { id } });
    } catch (error) {
        return res
            .status(500)
            .send({ message: 'Não foi possível remover o filme' });
    }
    res.status(200).send('Filme removido com sucesso.');
});

app.get('/movies/genre/:genreName', async (req, res) => {
    try {
        const genreName = req.params.genreName;
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: 'insensitive',
                    },
                },
            },
        });

        res.status(200).send(moviesFilteredByGenreName);
    } catch (error) {
        res.status(500).send({
            message: 'Falha ao filtrar filmes por gênero.',
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
