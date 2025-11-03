import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PrescriptionStatus } from './entities/prescription.entity';

@ApiTags('medications')
@Controller('medications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new medication (Admin only)' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationsService.create(createMedicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medications' })
  @ApiResponse({ status: 200, description: 'List of medications' })
  findAll() {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication details' })
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update medication (Admin only)' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateMedicationDto>) {
    return this.medicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete medication (Admin only)' })
  @ApiResponse({ status: 200, description: 'Medication deleted successfully' })
  remove(@Param('id') id: string) {
    return this.medicationsService.remove(id);
  }

  @Post('prescriptions')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 400, description: 'Duplicate collection detected' })
  createPrescription(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.medicationsService.createPrescription(createPrescriptionDto);
  }

  @Get('prescriptions/all')
  @ApiOperation({ summary: 'Get all prescriptions with optional filters' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['collected', 'pending', 'overdue'] })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  findAllPrescriptions(
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ) {
    return this.medicationsService.findAllPrescriptions({ patientId, status });
  }

  @Get('prescriptions/:id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription details' })
  findPrescription(@Param('id') id: string) {
    return this.medicationsService.findPrescription(id);
  }

  @Patch('prescriptions/:id/status')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update prescription status' })
  @ApiResponse({ status: 200, description: 'Prescription status updated' })
  updatePrescriptionStatus(
    @Param('id') id: string,
    @Body('status') status: PrescriptionStatus,
  ) {
    return this.medicationsService.updatePrescriptionStatus(id, status);
  }

  @Delete('prescriptions/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Delete prescription' })
  @ApiResponse({ status: 200, description: 'Prescription deleted successfully' })
  removePrescription(@Param('id') id: string) {
    return this.medicationsService.removePrescription(id);
  }

  @Post('prescriptions/update-overdue')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update overdue prescriptions status' })
  @ApiResponse({ status: 200, description: 'Overdue prescriptions updated' })
  updateOverdue() {
    return this.medicationsService.updateOverduePrescriptions();
  }
}

