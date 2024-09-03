import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { Profile } from '../src/profile/entities/profile.entity';
import { Contract } from '../src/contract/entities/contract.entity';
import { Job } from '../src/job/entities/job.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContractStatus } from '../src/contract/entities/contract.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let profileRepository: Repository<Profile>;
  let contractRepository: Repository<Contract>;
  let jobRepository: Repository<Job>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    profileRepository = moduleFixture.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    contractRepository = moduleFixture.get<Repository<Contract>>(
      getRepositoryToken(Contract),
    );
    jobRepository = moduleFixture.get<Repository<Job>>(getRepositoryToken(Job));
  });

  afterAll(async () => {
    await getConnection().close();
  });

  // Helper function to create a profile for testing
  const createProfile = async (id: number, balance: number) => {
    const profile = profileRepository.create({ id, balance });
    await profileRepository.save(profile);
    return profile;
  };

  // Helper function to create a contract for testing
  const createContract = async (
    id: number,
    client: Profile,
    contractor: Profile,
  ) => {
    const contract = contractRepository.create({
      id,
      client,
      contractor,
      status: ContractStatus.IN_PROGRESS, // Use the enum here
    });
    await contractRepository.save(contract);
    return contract;
  };

  // Helper function to create a job for testing
  const createJob = async (id: number, price: number, contract: Contract) => {
    const job = jobRepository.create({ id, price, contract, isPaid: false });
    await jobRepository.save(job);
    return job;
  };

  describe('/api/v1/contracts/:id (GET)', () => {
    it('should return a contract by ID for a valid profile', async () => {
      const profile = await createProfile(1, 1000);
      const contract = await createContract(1, profile, profile);

      return request(app.getHttpServer())
        .get(`/api/v1/contracts/${contract.id}`)
        .set('Profile-Id', profile.id.toString())
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(contract.id);
        });
    });

    it('should return 404 if contract is not found', async () => {
      const profile = await createProfile(2, 1000);

      return request(app.getHttpServer())
        .get('/api/v1/contracts/9999')
        .set('Profile-Id', profile.id.toString())
        .expect(404);
    });
  });

  describe('/api/v1/contracts (GET)', () => {
    it('should return all contracts for a profile', async () => {
      const profile = await createProfile(3, 1000);
      await createContract(2, profile, profile);
      await createContract(3, profile, profile);

      return request(app.getHttpServer())
        .get('/api/v1/contracts')
        .set('Profile-Id', profile.id.toString())
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
        });
    });
  });

  describe('/api/v1/jobs/unpaid (GET)', () => {
    it('should return unpaid jobs for a profile', async () => {
      const profile = await createProfile(4, 1000);
      const contract = await createContract(4, profile, profile);
      await createJob(1, 100, contract);

      return request(app.getHttpServer())
        .get('/api/v1/jobs/unpaid')
        .set('Profile-Id', profile.id.toString())
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(1);
          expect(res.body[0].isPaid).toBe(false);
        });
    });
  });

  describe('/api/v1/jobs/:jobId/pay (POST)', () => {
    it('should pay for a job and update balances', async () => {
      const client = await createProfile(5, 1000);
      const contractor = await createProfile(6, 500);
      const contract = await createContract(5, client, contractor);
      const job = await createJob(2, 100, contract);

      return request(app.getHttpServer())
        .post(`/api/v1/jobs/${job.id}/pay`)
        .set('Profile-Id', client.id.toString())
        .expect(201)
        .expect((res) => {
          expect(res.body.isPaid).toBe(true);
        });
    });

    it('should return 400 if job is already paid', async () => {
      const client = await createProfile(7, 1000);
      const contractor = await createProfile(8, 500);
      const contract = await createContract(6, client, contractor);
      const job = await createJob(3, 100, contract);

      await request(app.getHttpServer())
        .post(`/api/v1/jobs/${job.id}/pay`)
        .set('Profile-Id', client.id.toString())
        .expect(201);

      return request(app.getHttpServer())
        .post(`/api/v1/jobs/${job.id}/pay`)
        .set('Profile-Id', client.id.toString())
        .expect(400);
    });
  });

  describe('/api/v1/balances/deposit (POST)', () => {
    it('should deposit balance to a client profile', async () => {
      const profile = await createProfile(9, 1000);

      return request(app.getHttpServer())
        .post('/api/v1/balances/deposit')
        .send({ userId: profile.id, amount: 100 })
        .expect(201)
        .expect((res) => {
          expect(res.body.balance).toBe(1100);
        });
    });

    it('should return 400 if deposit exceeds 25% of unpaid jobs', async () => {
      const profile = await createProfile(10, 1000);
      const contract = await createContract(7, profile, profile);
      await createJob(4, 500, contract);

      return request(app.getHttpServer())
        .post('/api/v1/balances/deposit')
        .send({ userId: profile.id, amount: 150 })
        .expect(400);
    });
  });
});
