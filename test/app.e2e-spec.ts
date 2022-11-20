import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3000')
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.fr',
      password: 'TEST1234',
    };
    describe('Signup', () => {
      it('Should throw if email empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ password: dto.password }).expectStatus(400)
      });
      it('Should throw if pasword empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ email: dto.email }).expectStatus(400)
      });
      it('Should throw if both empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400)
      });
      it('Should signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201)
      });
    });
    describe('Login', () => {
      it('Should throw if email empty', () => {
        return pactum.spec().post('/auth/login').withBody({ password: dto.password }).expectStatus(400)
      });
      it('Should throw if pasword empty', () => {
        return pactum.spec().post('/auth/login').withBody({ email: dto.email }).expectStatus(400)
      });
      it('Should throw if both empty', () => {
        return pactum.spec().post('/auth/login').expectStatus(400)
      });
      it('Should login', () => {
        return pactum.spec().post('/auth/login').withBody(dto).expectStatus(200).stores('userAt', 'access_token')
      });
    });
  });

  describe('User', () => {
    describe('Get current user', () => {
      it('Should get current user', () => {
        return pactum.spec().get('/users/current').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(200)
      });
    });
    describe('Edit current user', () => {
      it('Should edit current user', () => {
        const dto: EditUserDto = {
          email: "test2@test.fr",
          first_name: "Prénom",
          last_name: "Nom",
        }
        return pactum.spec().patch('/users/current').withHeaders({ Authorization: 'Bearer $S{userAt}' }).withBody(dto).expectStatus(200)
      });
    });
  });
});