import { faker } from '@faker-js/faker';
import {
  Profile,
  ProfileRole,
} from '../../src/profile/entities/profile.entity';
import {
  Contract,
  ContractStatus,
} from '../../src/contract/entities/contract.entity';
import { Job } from '../../src/job/entities/job.entity';

// Function to generate fake profiles
export function generateProfiles(count: number): Profile[] {
  const profiles: Profile[] = [];

  for (let i = 0; i < count; i++) {
    const role: ProfileRole =
      i % 2 === 0 ? ProfileRole.CLIENT : ProfileRole.CONTRACTOR;

    profiles.push({
      uuid: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      profession: role === 'client' ? 'Client' : faker.person.jobTitle(),
      balance: parseFloat(
        faker.finance.amount({
          min: 100,
          max: 1000,
          dec: 2,
          symbol: '$',
          autoFormat: true,
        }),
      ),
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 0,
    });
  }

  return profiles;
}

// Function to generate fake contracts
export function generateContracts(
  count: number,
  profiles: Profile[],
): Contract[] {
  const contracts: Contract[] = [];

  // Filter profiles to get lists of clients and contractors
  const clients = profiles.filter((profile) => profile.role === 'client');
  const contractors = profiles.filter(
    (profile) => profile.role === 'contractor',
  );

  for (let i = 0; i < count; i++) {
    const client = clients[i % clients.length]; // Get a client by cycling through the list
    const contractor = contractors[i % contractors.length]; // Get a contractor by cycling through the list

    contracts.push({
      uuid: faker.string.uuid(),
      terms: faker.lorem.paragraph(),
      status:
        i % 2 === 0
          ? ('in_progress' as ContractStatus)
          : ('new' as ContractStatus),
      contractor: contractor, // Assign the contractor profile object
      client: client, // Assign the client profile object
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Contract); // Using 'as Contract' to assert type
  }

  return contracts;
}

// Function to generate fake jobs
export function generateJobs(count: number, contracts: Contract[]): Job[] {
  const jobs: Job[] = [];

  for (let i = 0; i < count; i++) {
    jobs.push({
      uuid: faker.string.uuid(),
      description: faker.lorem.sentence(),
      price: parseFloat(
        faker.finance.amount({
          min: 100,
          max: 1000,
          dec: 2,
          symbol: '$',
          autoFormat: true,
        }),
      ),
      isPaid: false,
      paidDate: null,
      contract: contracts[i % contracts.length], // Assign the entire contract object
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Job); // Using 'as Job' to assert type
  }

  return jobs;
}
