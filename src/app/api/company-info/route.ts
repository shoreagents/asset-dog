import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch company info
export async function GET() {
  try {
    // Get the first (and should be only) company info record
    const companyInfo = await prisma.company_info.findFirst();
    
    if (!companyInfo) {
      // Return default values if no company info exists yet
      return NextResponse.json({
        company: "Asset Dog Inc.",
        organizationType: "",
        country: "United States",
        address: "123 Business Street",
        aptSuite: "",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        timezone: "America/New_York",
        currency: "USD",
        logoUrl: null,
      });
    }

    // Convert snake_case to camelCase for frontend
    return NextResponse.json({
      id: companyInfo.id,
      company: companyInfo.company,
      organizationType: companyInfo.organization_type || "",
      country: companyInfo.country || "",
      address: companyInfo.address || "",
      aptSuite: companyInfo.apt_suite || "",
      city: companyInfo.city || "",
      state: companyInfo.state || "",
      postalCode: companyInfo.postal_code || "",
      timezone: companyInfo.timezone || "",
      currency: companyInfo.currency || "",
      logoUrl: companyInfo.logo_url || null,
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}

// PUT - Update company info
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Convert camelCase to snake_case for database
    const data = {
      company: body.company,
      organization_type: body.organizationType,
      country: body.country,
      address: body.address,
      apt_suite: body.aptSuite,
      city: body.city,
      state: body.state,
      postal_code: body.postalCode,
      timezone: body.timezone,
      currency: body.currency,
      logo_url: body.logoUrl,
      updated_at: new Date(),
    };

    // Try to find existing company info
    const existingInfo = await prisma.company_info.findFirst();

    let companyInfo;
    if (existingInfo) {
      // Update existing record
      companyInfo = await prisma.company_info.update({
        where: { id: existingInfo.id },
        data,
      });
    } else {
      // Create new record
      companyInfo = await prisma.company_info.create({
        data,
      });
    }

    // Convert back to camelCase for response
    return NextResponse.json({
      id: companyInfo.id,
      company: companyInfo.company,
      organizationType: companyInfo.organization_type,
      country: companyInfo.country,
      address: companyInfo.address,
      aptSuite: companyInfo.apt_suite,
      city: companyInfo.city,
      state: companyInfo.state,
      postalCode: companyInfo.postal_code,
      timezone: companyInfo.timezone,
      currency: companyInfo.currency,
      logoUrl: companyInfo.logo_url,
    });
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company information' },
      { status: 500 }
    );
  }
}





